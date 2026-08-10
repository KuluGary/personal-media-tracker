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
import { SyncProgressReporter } from "@/sync/SyncProgressReport";

import type { SourceConfigurationField } from "../SourceConfigurationField";
import type { SourceDefinition } from "../SourceDefinition";

import { InvalidSourceConfiguration } from "../InvalidSourceException";
import { RetroachievementsClient } from "./RetroachievementsClient";
import { RetroachievementsNormalizer } from "./RetroachievementsNormalizer";
import { RetroachievementsSync } from "./RetroachievementsSync";

export const retroachievementsSourceSchema = z.object({
  apiKey: z.string(),
  userId: z.string(),
});

export const RETROACHIEVEMENTS_SYNCS = {
  GAMES: "games",
  ACHIEVEMENTS: "achievements",
};

export class RetroachievementsSource implements SourceDefinition {
  id = "retroachievements";
  displayName = "Retroachievements";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  hasConfiguration() {
    return !!this.config.sources.retroachievements;
  }

  getValidatedConfiguration() {
    const source = retroachievementsSourceSchema.safeParse(this.config.sources.retroachievements);

    if (!source.success) {
      throw new InvalidSourceConfiguration(
        this.displayName,
        source.error,
      );
    }

    return source.data;
  }

  async createSync(request?: SyncRequest) {
    const source = this.getValidatedConfiguration();

    const client = new RetroachievementsClient(source.apiKey, source.userId);
    const normalizer = new RetroachievementsNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs);

    return new RetroachievementsSync(client, normalizer, repositories, progress, request);
  }

  getConfigurationSchema() {
    return retroachievementsSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(configuration: unknown) {
    const source = retroachievementsSourceSchema.parse(configuration);

    const client = new RetroachievementsClient(
      source.apiKey,
      source.userId,
    );

    await client.validate();
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "apiKey", type: "password", label: "API key" },
      { key: "userId", type: "text", label: "User ID" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "games", displayName: "Games" },
      { id: "achievements", displayName: "Achievements" },
    ];
  }
}
