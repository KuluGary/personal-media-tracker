import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
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

  constructor(private readonly config: AppConfig) { }

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
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new MangaDexSync(client, normalizer, entities, metadata, relationships, syncs);
  }
}
