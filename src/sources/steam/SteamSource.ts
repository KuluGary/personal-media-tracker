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
import { SteamClient } from "./SteamClient";
import { SteamNormalizer } from "./SteamNormalizer";
import { SteamSync } from "./SteamSync";

export const steamSourceSchema = z.object({
  apiKey: z.string(),
  steamId: z.string(),
});

export class SteamSource implements SourceDefinition {
  id = "steam";
  displayName = "Steam";

  constructor(private readonly config: AppConfig) { }

  hasConfiguration() {
    return !!this.config.sources.steam;
  }

  getValidatedConfiguration() {
    const source = steamSourceSchema.safeParse(this.config.sources.steam);

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

    const client = new SteamClient(source.apiKey, source.steamId);
    const normalizer = new SteamNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const time = new TimeRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new SteamSync(client, normalizer, entities, metadata, relationships, time, syncs);
  }
}
