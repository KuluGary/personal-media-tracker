import z from "zod";

import type { AppConfig } from "@/config/AppConfig";
import type { TrackerDatabase } from "@/db/types";
import type { SyncDefinition } from "@/sync/SyncDefinition";

import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceConfigurationField } from "../SourceConfigurationField";
import type { SourceDefinition } from "../SourceDefinition";

import { InvalidSourceConfiguration } from "../InvalidSourceException";
import { TraktClient } from "./TraktClient";
import { TraktNormalizer } from "./TraktNormalizer";
import { TraktSync } from "./TraktSync";

export const traktSourceSchema = z.object({
  apiKey: z.string(),
  userId: z.string(),
});

export class TraktSource implements SourceDefinition {
  id = "trakt";
  displayName = "Trakt";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  hasConfiguration() {
    return !!this.config.sources.retroachievements;
  }

  getValidatedConfiguration() {
    const source = traktSourceSchema.safeParse(this.config.sources.trakt);

    if (!source.success) {
      throw new InvalidSourceConfiguration(
        this.displayName,
        source.error,
      );
    }

    return source.data;
  }

  async createSync() {
    const source = this.getValidatedConfiguration();

    const client = new TraktClient(source.apiKey, source.userId);
    const normalizer = new TraktNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);

    return new TraktSync(client, normalizer, entities, metadata, relationships, syncs);
  }

  getConfigurationSchema() {
    return traktSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(configuration: unknown): Promise<void> {
    const source = traktSourceSchema.parse(configuration);

    const _client = new TraktClient(
      source.apiKey,
      source.userId,
    );
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "apiKey", type: "password", label: "API Key" },
      { key: "userId", type: "text", label: "User ID" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "favorite-shows", displayName: "Favorite shows" },
      { id: "watchlist-shows", displayName: "Watchlist shows" },
      { id: "favorite-movies", displayName: "Favorite movies" },
      { id: "watchlist-movies", displayName: "Watchlist movies" },
    ];
  }
}
