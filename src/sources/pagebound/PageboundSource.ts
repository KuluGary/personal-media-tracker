import z from "zod";

import type { AppConfig } from "@/config/AppConfig";

import { db } from "@/db/supabase";
import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";
import { TrackableRepository } from "@/repositories/TrackableRepository";

import type { SourceDefinition } from "../utils/SourceDefinition";

import { InvalidSourceConfiguration } from "../utils/InvalidSourceException";
import { PageboundClient } from "./PageboundClient";
import { PageboundNormalizer } from "./PageboundNormalizer";
import { PageboundSync } from "./PageboundSync";

export const pageboundSourceSchema = z.object({
  userId: z.string(),
});

export class PageboundSource implements SourceDefinition {
  id = "pagebound";
  displayName = "Pagebound";

  constructor(private readonly config: AppConfig) { }

  hasConfiguration() {
    return !!this.config.sources.pagebound;
  }

  getValidatedConfiguration() {
    const source = pageboundSourceSchema.safeParse(this.config.sources.pagebound);

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

    const client = new PageboundClient(source.userId);
    const normalizer = new PageboundNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const trackable = new TrackableRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new PageboundSync(client, normalizer, entities, metadata, relationships, trackable, syncs);
  }
}
