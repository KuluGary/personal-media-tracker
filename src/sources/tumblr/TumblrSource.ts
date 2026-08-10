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
import { SyncProgressReporter } from "@/sync/SyncProgressReport";

import type { SourceConfigurationField } from "../SourceConfigurationField";
import type { SourceDefinition } from "../SourceDefinition";

import { InvalidSourceConfiguration } from "../InvalidSourceException";
import { TumblrClient } from "./TumblrClient";
import { TumblrNormalizer } from "./TumblrNormalizer";
import { TumblrSync } from "./TumblrSync";

export const tumblrSourceSchema = z.object({
  consumerKey: z.string(),
  blogIdentifier: z.string(),
});

/**
 * Defines methods to configure application sources for the Tumblr integration.
 */
export class TumblrSource implements SourceDefinition {
  id = "tumblr";
  displayName = "Tumblr";

  constructor(private readonly config: AppConfig, private readonly db: TrackerDatabase) { }

  /**
   * Returns whether a Tumblr source configuration exists.
   */
  hasConfiguration() {
    return !!this.config.sources.tumblr;
  }

  /**
   * Returns the validated Tumblr configuration.
   * Throws InvalidSourceConfiguration if the configured values are invalid.
   */
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

  /**
   * Creates a fully configured TumblrSync instance with all required dependencies.
   */
  async createSync(request?: SyncRequest) {
    const source = this.getValidatedConfiguration();

    const client = new TumblrClient(source.consumerKey, source.blogIdentifier);
    const normalizer = new TumblrNormalizer();
    const entities = new EntityRepository(this.db);
    const metadata = new MetadataRepository(this.db);
    const relationships = new RelationshipRepository(this.db);
    const syncs = new SourceSyncRepository(this.db);
    const progress = new SyncProgressReporter();

    const repositories = new Repositories(entities, metadata, relationships, syncs);

    return new TumblrSync(client, normalizer, repositories, progress, request);
  }

  /**
   * Returns the Zod schema used to validate Tumblr configuration.
   */
  getConfigurationSchema() {
    return tumblrSourceSchema;
  }

  /**
   * Normalizes user supplied configuration into the format expected by the Tumblr API.
   */
  async normalizeConfiguration(configuration: Record<string, unknown>) {
    return {
      ...configuration,
      blogIdentifier: this.normalizeBlogIdentifier(
        configuration.blogIdentifier as string,
      ),
    };
  }

  /**
   * Validates the supplied configuration and verifies that it can access the Tumblr API.
   * Throws if validation or the connectivity check fails.
   */
  async validateConfiguration(configuration: unknown) {
    const source = tumblrSourceSchema.parse(configuration);

    const client = new TumblrClient(
      source.consumerKey,
      source.blogIdentifier,
    );

    await client.validate();
  }

  /**
   * Normalizes a blog identifier into a canonical Tumblr hostname.
   *
   * Accepts usernames, Tumblr hostnames, and Tumblr blog URLs.
   * Always returns a value in the form "<blog>.tumblr.com".
   */
  private normalizeBlogIdentifier(input: string): string {
    const value = input.trim();

    try {
      const url = new URL(value);

      if (url.hostname.endsWith(".tumblr.com")) {
        return url.hostname.toLowerCase();
      }

      if (url.hostname === "www.tumblr.com") {
        const parts = url.pathname.split("/").filter(Boolean);

        if (parts[0] === "blog" && parts[1]) {
          return parts[1].replace(/\/$/, "").toLowerCase();
        }

        if (parts[0]) {
          return `${parts[0]}.tumblr.com`;
        }
      }
    }
    catch {
      // Not a URL.
    }

    if (value.endsWith(".tumblr.com")) {
      return value.toLowerCase();
    }

    return `${value}.tumblr.com`;
  }

  getConfigurationFields(): SourceConfigurationField[] {
    return [
      { key: "consumerKey", type: "password", label: "Consumer Key" },
      { key: "blogIdentifier", type: "text", label: "Blog name or URL" },
    ];
  }

  getSyncDefinitions(): SyncDefinition[] {
    return [
      { id: "posts", displayName: "Posts" },
    ];
  }
}
