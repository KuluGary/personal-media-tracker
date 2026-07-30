import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { FreshRSSClient } from "./FreshRssClient";
import { FreshRSSNormalizer } from "./FreshRssNormalizer";
import { FreshRSSSync } from "./FreshRssSync";

export const freshRssSourceSchema = z.object({
  apiPassword: z.string(),
  userName: z.string(),
});

export class FreshRSSSource implements SourceDefinition {
  id = "freshrss";
  displayName = "FreshRSS";

  constructor(private readonly config: AppConfig) { }

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

  async createSync() {
    const source = this.getValidatedConfiguration();

    const client = new FreshRSSClient(source.apiPassword, source.userName);
    const normalizer = new FreshRSSNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new FreshRSSSync(client, normalizer, entities, metadata, relationships, syncs);
  }
}
