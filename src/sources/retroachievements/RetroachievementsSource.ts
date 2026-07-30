import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { RetroachievementsClient } from "./RetroachievementsClient";
import { RetroachievementsNormalizer } from "./RetroachievementsNormalizer";
import { RetroachievementsSync } from "./RetroachievementsSync";

export const retroachievementsSourceSchema = z.object({
  apiKey: z.string(),
  userId: z.string(),
});

export class RetroachievementsSource implements SourceDefinition {
  id = "retroachievements";
  displayName = "Retroachievements";

  constructor(private readonly config: AppConfig) { }

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

  async createSync() {
    const source = this.getValidatedConfiguration();

    const client = new RetroachievementsClient(source.apiKey, source.userId);
    const normalizer = new RetroachievementsNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new RetroachievementsSync(client, normalizer, entities, metadata, relationships, syncs);
  }
}
