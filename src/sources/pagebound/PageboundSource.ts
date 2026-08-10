import z from "zod";

import type { AppConfig } from "@/config/AppConfig";
import type { TrackerDatabase } from "@/db/types";
import type { SyncRequest } from "@/sync/SyncRequest";

import { EntityRepository } from "@/repositories/EntityRepository";
import { MetadataRepository } from "@/repositories/MetadataRepository";
import { RelationshipRepository } from "@/repositories/RelationshipRepository";
import { Repositories } from "@/repositories/Repositories";
import { SourceSyncRepository } from "@/repositories/SourceSyncRepository";
import { TrackableRepository } from "@/repositories/TrackableRepository";
import { SyncProgressReporter } from "@/sync/SyncProgressReport";

import type { SourceConfigurationField } from "../SourceConfigurationField";
import type { SourceDefinition } from "../SourceDefinition";

import { InvalidSourceConfiguration } from "../InvalidSourceException";
import { PageboundClient } from "./PageboundClient";
import { PageboundNormalizer } from "./PageboundNormalizer";
import { PageboundSync } from "./PageboundSync";

export const pageboundSourceSchema = z.object({
  userId: z.string(),
});

export const PAGEBOUND_SYNCS = {
  FINISHED: "finished",
  CURRENT: "current",
  TBR: "tbr",
} as const;

/**
 * Defines methods to configure application sources for the Pagebound integration.
 */
export class PageboundSource implements SourceDefinition {
  id = "pagebound";
  displayName = "Pagebound";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  /**
   * Returns whether a Pagebound source configuration exists.
   */
  hasConfiguration() {
    return !!this.config.sources.pagebound;
  }

  /**
   * Returns the validated Pagebound configuration.
   * Throws InvalidSourceConfiguration if the configured values are invalid.
   */
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

  /**
   * Creates a fully configured PageboundSync instance with all required dependencies.
   */
  async createSync(request?: SyncRequest) {
    const source = this.getValidatedConfiguration();

    const client = new PageboundClient(source.userId);
    const normalizer = new PageboundNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const trackable = new TrackableRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs, undefined, trackable);

    return new PageboundSync(client, normalizer, repositories, progress, request);
  }

  /**
   * Returns the Zod schema used to validate Pagebound configuration.
   */
  getConfigurationSchema() {
    return pageboundSourceSchema;
  }

  /**
   * Normalizes user supplied configuration into the format expected by the Pagebound API.
   */
  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return configuration;
  }

  /**
   * Validates the supplied configuration and verifies that it can access the Pagebound API.
   * Throws if validation or the connectivity check fails.
   */
  async validateConfiguration(configuration: unknown) {
    const source = pageboundSourceSchema.parse(configuration);

    const client = new PageboundClient(
      source.userId,
    );

    await client.validate();
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "useuserIdrName", type: "text", label: "User name" },
    ];
  }

  getSyncDefinitions() {
    return [
      { id: PAGEBOUND_SYNCS.FINISHED, displayName: "Finished books" },
      { id: PAGEBOUND_SYNCS.CURRENT, displayName: "Currently reading" },
      { id: PAGEBOUND_SYNCS.TBR, displayName: "To be read" },
    ];
  }
}
