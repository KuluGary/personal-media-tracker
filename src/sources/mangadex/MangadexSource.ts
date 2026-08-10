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
import { MangaDexClient } from "./MangaDexClient";
import { MangaDexNormalizer } from "./MangaDexNormalizer";
import { MangaDexSync } from "./MangaDexSync";

export const mangaDexSourceSchema = z.object({
  userId: z.string(),
  password: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
});

export class MangaDexSource implements SourceDefinition {
  id = "mangadex";
  displayName = "MangaDex";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  hasConfiguration() {
    return !!this.config.sources.mangadex;
  }

  getValidatedConfiguration() {
    const source = mangaDexSourceSchema.safeParse(this.config.sources.mangadex);

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

    const client = new MangaDexClient(source.userId, source.password, source.clientId, source.clientSecret);
    const normalizer = new MangaDexNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);

    return new MangaDexSync(client, normalizer, entities, metadata, relationships, syncs);
  }

  getConfigurationSchema() {
    return mangaDexSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(configuration: unknown) {
    const source = mangaDexSourceSchema.parse(configuration);

    const client = new MangaDexClient(
      source.userId,
      source.password,
      source.clientId,
      source.clientSecret,
    );

    await client.validate();
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "userId", type: "text", label: "User ID" },
      { key: "password", type: "password", label: "Password" },
      { key: "clientId", type: "text", label: "Client ID" },
      { key: "clientSecret", type: "password", label: "Client secret" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "followed", displayName: "Followed manga" },
    ];
  }
}
