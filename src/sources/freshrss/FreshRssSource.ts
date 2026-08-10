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
import { FreshRSSClient } from "./FreshRssClient";
import { FreshRSSNormalizer } from "./FreshRssNormalizer";
import { FreshRSSSync } from "./FreshRssSync";

export const freshRssSourceSchema = z.object({
  apiPassword: z.string(),
  userName: z.string(),
});

export const FRESH_RSS_SYNCS = {
  SUBSCRIPTIONS: "subscriptions",
  STARRED_ENTRIES: "starred_entries",
} as const;

export class FreshRSSSource implements SourceDefinition {
  id = "freshrss";
  displayName = "FreshRSS";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  hasConfiguration() {
    return !!this.config.sources.freshrss;
  }

  getValidatedConfiguration() {
    const source = freshRssSourceSchema.safeParse(this.config.sources.freshrss);

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

    const client = new FreshRSSClient(source.userName, source.apiPassword);
    const normalizer = new FreshRSSNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs);

    return new FreshRSSSync(client, normalizer, repositories, progress, request);
  }

  getConfigurationSchema() {
    return freshRssSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(configuration: unknown) {
    const source = freshRssSourceSchema.parse(configuration);

    const client = new FreshRSSClient(
      source.userName,
      source.apiPassword,
    );

    await client.validate();
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "apiPassword", type: "password", label: "API Password" },
      { key: "userName", type: "text", label: "User name" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "subscriptions", displayName: "Subscriptions" },
      { id: "starred", displayName: "Starred" },
    ];
  }
}
