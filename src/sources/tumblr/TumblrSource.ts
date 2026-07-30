import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { TumblrClient } from "./TumblrClient";
import { TumblrNormalizer } from "./TumblrNormalizer";
import { TumblrSync } from "./TumblrSync";

export const tumblrSourceSchema = z.object({
  consumerKey: z.string(),
  blogIdentifier: z.string(),
});

export class TumblrSource implements SourceDefinition {
  id = "tumblr";
  displayName = "Tumblr";

  constructor(private readonly config: AppConfig) { }

  hasConfiguration() {
    return !!this.config.sources.tumblr;
  }

  getValidatedConfiguration() {
    const source = tumblrSourceSchema.safeParse(this.config.sources.tumblr);

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

    const client = new TumblrClient(source.consumerKey, source.blogIdentifier);
    const normalizer = new TumblrNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new TumblrSync(client, normalizer, entities, metadata, relationships, syncs);
  }
}
