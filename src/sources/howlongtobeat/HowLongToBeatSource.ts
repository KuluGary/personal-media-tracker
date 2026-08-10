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
import { HowLongToBeatClient } from "./HowLongToBeatClient";
import { HowLongToBeatNormalizer } from "./HowLongToBeatNormalizer";
import { HowLongToBeatSync } from "./HowLongToBeatSync";

export const howLongToBeatSourceSchema = z.object({
  userId: z.string(),
});

export const HOW_LONG_TO_BEAT_SYNCS = {
  PLAYING: "playing",
  BACKLOG: "backlog",
  FAVOURITE: "favourite",
  COMPLETED: "completed",
  RETIRED: "retired",
} as const;

export class HowLongToBeatSource implements SourceDefinition {
  id = "howlongtobeat";
  displayName = "How Long To Beat";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) {}

  hasConfiguration() {
    return !!this.config.sources.howlongtobeat;
  }

  getValidatedConfiguration() {
    const source = howLongToBeatSourceSchema.safeParse(this.config.sources.howlongtobeat);

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

    const client = new HowLongToBeatClient(source.userId);
    const normalizer = new HowLongToBeatNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const time = new TimeRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs, time);

    return new HowLongToBeatSync(client, normalizer, repositories, progress, request);
  }

  getConfigurationSchema() {
    return howLongToBeatSourceSchema;
  }

  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  async validateConfiguration(_configuration: unknown) {}

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "userId", type: "text", label: "User ID" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "games", displayName: "Games" },
    ];
  }
}
