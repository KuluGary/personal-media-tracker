import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { TraktClient } from "./TraktClient";
import { TraktNormalizer } from "./TraktNormalizer";
import { TraktSync } from "./TraktSync";

export const traktSourceSchema = z.object({
  apiKey: z.string(),
  userId: z.string(),
});

export class TraktSource implements SourceDefinition {
  id = "Traks";
  displayName = "Trakt.tv";

  constructor(private readonly config: AppConfig) { }

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
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new TraktSync(client, normalizer, entities, metadata, relationships, syncs);
  }
}
