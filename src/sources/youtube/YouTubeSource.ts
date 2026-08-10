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
import { YouTubeClient } from "./YouTubeClient";
import { YouTubeNormalizer } from "./YouTubeNormalizer";
import { YouTubeSync } from "./YouTubeSync";

export const youTubeSourceSchema = z.object({
  apiKey: z.string(),
});

/**
 * Defines methods to configure application sources for the YouTube integration.
 */
export class YouTubeSource implements SourceDefinition {
  id = "youtube";
  displayName = "YouTube";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  /**
   * Returns whether a YouTube source configuration exists.
   */
  hasConfiguration() {
    return !!this.config.sources.youtube;
  }

  /**
   * Returns the validated YouTube configuration.
   * Throws InvalidSourceConfiguration if the configured values are invalid.
   */
  getValidatedConfiguration() {
    const source = youTubeSourceSchema.safeParse(this.config.sources.youtube);

    if (!source.success) {
      throw new InvalidSourceConfiguration(
        this.displayName,
        source.error,
      );
    }

    return source.data;
  }

  /**
   * Creates a fully cofigured YouTube instance with all required dependencies.
   */
  async createSync(request?: SyncRequest) {
    const source = this.getValidatedConfiguration();

    const client = new YouTubeClient(source.apiKey);
    const normalzier = new YouTubeNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const time = new TimeRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs, time);

    return new YouTubeSync(client, normalzier, repositories, progress, request);
  }

  getConfigurationSchema() {
    return youTubeSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(_configuration: unknown) {
    // const source = youTubeSourceSchema.parse(configuration);
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "apiKey", type: "password", label: "API key" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      {
        id: "playlist-items",
        displayName: "Playlist videos",
        parameters: [
          {
            id: "playlist",
            displayName: "Playlist",
            required: true,
            description: "Playlist ID or URL",
            type: "text",
          },
        ],
      },
    ];
  }
}
