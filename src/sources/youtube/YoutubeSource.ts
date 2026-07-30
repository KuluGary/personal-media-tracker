import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";
import { TimeRepository } from "@/repositories/TimeRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { YouTubeClient } from "./YouTubeClient";
import { YouTubeNormalizer } from "./YouTubeNormalizer";
import { YouTubeSync } from "./YouTubeSync";

export const youTubeSourceSchema = z.object({
  apiKey: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  refreshToken: z.string(),
});

export class YouTubeSource implements SourceDefinition {
  id = "youtube";
  displayName = "YouTube";

  constructor(private readonly config: AppConfig) { }

  hasConfiguration() {
    return !!this.config.sources.youtube;
  }

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

  async createSync() {
    const source = this.getValidatedConfiguration();

    const client = new YouTubeClient(source.apiKey, source.clientId, source.clientSecret, source.refreshToken);
    const normalzier = new YouTubeNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const time = new TimeRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new YouTubeSync(client, normalzier, entities, metadata, relationships, time, syncs);
  }
}
