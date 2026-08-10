import z from "zod";

import type { AppConfig } from "@/config/AppConfig";
import type { TrackerDatabase } from "@/db/types";
import type { SyncDefinition } from "@/sync/SyncDefinition";
import type { SyncRequest } from "@/sync/SyncRequest";

import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { Repositories } from "@/repositories/Repositories";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";
import { TimeRepository } from "@/repositories/TimeRepository";
import { SyncProgressReporter } from "@/sync/SyncProgressReport";

import type { SourceConfigurationField } from "../SourceConfigurationField";
import type { SourceDefinition } from "../SourceDefinition";

import { InvalidSourceConfiguration } from "../InvalidSourceException";
import { SteamClient } from "./SteamClient";
import { SteamNormalizer } from "./SteamNormalizer";
import { SteamSync } from "./SteamSync";

export const steamSourceSchema = z.object({
  apiKey: z.string(),
  steamId: z.string(),
});

export const STEAM_SYNCS = {
  GAMES: "games",
  ACHIEVEMENTS: "achievements",
} as const;

/**
 * Defines methods to configure application sources for the Steam integration.
 */
export class SteamSource implements SourceDefinition {
  id = "steam";
  displayName = "Steam";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  /**
   * Returns whether a Steam source configuration exists.
   */
  hasConfiguration() {
    return !!this.config.sources.steam;
  }

  /**
   * Returhs the validated Steam configuration.
   * Throws InvalidSourceConfiguration if the configured values are invalid.
   */
  getValidatedConfiguration() {
    const source = steamSourceSchema.safeParse(this.config.sources.steam);

    if (!source.success) {
      throw new InvalidSourceConfiguration(
        this.displayName,
        source.error,
      );
    }

    return source.data;
  }

  /**
   * Creates a fully configured SteamSync instance with all required dependencies.
   */
  async createSync(request?: SyncRequest) {
    const source = this.getValidatedConfiguration();

    const client = new SteamClient(source.apiKey, source.steamId);
    const normalizer = new SteamNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const time = new TimeRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs, time);

    return new SteamSync(client, normalizer, repositories, progress, request);
  }

  /**
   * Returns the Zod schema used to validate Steam configuration.
   */
  getConfigurationSchema() {
    return steamSourceSchema;
  }

  /**
   * Normalizes user supplied configuration into the format expected by the Steam API
   */
  async normalizeConfiguration(configuration: Record<string, unknown>) {
    const client = new SteamClient(configuration.apiKey as string, configuration.steamId as string);

    return {
      ...configuration,
      steamId: await client.resolveSteamId(
        configuration.steamId as string,
      ),
    };
  }

  /**
   * Validates the supplied configuration and verifies that it can access the Steam API.
   * Throws if validation or the connectivity check fails.
   */
  async validateConfiguration(configuration: unknown) {
    const source = steamSourceSchema.safeParse(configuration);

    if (!source.data)
      throw new Error("Invalid source configuration");

    const client = new SteamClient(source.data.apiKey, source.data.steamId);

    await client.validate();
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "apiKey", type: "password", label: "API Key" },
      { key: "steamId", type: "text", label: "Steam ID or profile URL" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "games", displayName: "Games" },
      { id: "achievements", displayName: "Achievements" },
    ];
  }
}
