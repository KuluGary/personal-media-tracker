import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { FreshRSSClient } from "./FreshRssClient";
import type { FreshRSSNormalizer } from "./FreshRssNormalizer";

import { FRESH_RSS_SYNCS } from "./FreshRssSource";

export class FreshRSSSync {
  constructor(
    private client: FreshRSSClient,
    private normalizer: FreshRSSNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  async run() {
    switch (this.request?.syncId) {
      case FRESH_RSS_SYNCS.SUBSCRIPTIONS:
        return this.runSubscriptions();

      case FRESH_RSS_SYNCS.STARRED_ENTRIES:
        return this.runStarredEntries();

      default:
        await this.runSubscriptions();
        await this.runStarredEntries();
    }
  }

  private async runSubscriptions() {
    const syncId = await this.repositories.syncs.start("freshrss_blogs");

    this.progress.start("Fetching \"subscriptions\"...");

    try {
      const blogs = await this.client.fetchSubscriptions(this.request?.params?.tag);

      let processed = 0;

      for (const blog of blogs) {
        const normalized = this.normalizer.normalizeSubscription(blog);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);

        processed++;
      }

      this.progress.success(`Processed ${processed} \"subscriptions\"`);

      await this.repositories.syncs.success(syncId, {
        blogs_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "subscriptions": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  private async runStarredEntries() {
    const syncId = await this.repositories.syncs.start("freshrss_blog_posts");

    this.progress.start("Fetching \"starred entries\"...");

    try {
      const subscriptions = await this.client.fetchSubscriptions(this.request?.params?.tag);

      const latestPostDateStr
        = await this.repositories.entities.getLatestCreatedAt("post");

      let updatedAfter: number | undefined;

      if (latestPostDateStr) {
        updatedAfter = Math.floor(
          new Date(latestPostDateStr).getTime() / 1000,
        );
      }

      const entries = await this.client.fetchStarredEntries(subscriptions, updatedAfter);

      const subscriptionMap = new Map(
        subscriptions.map(b => [b.id, b.title]),
      );

      let processed = 0;

      for (const entry of entries) {
        const normalized = this.normalizer.normalizeEntry(entry);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId: postEntityId }
          = await this.repositories.entities.getOrCreateFromSource({
            kind: normalized.kind,
            title: normalized.title,
            source: normalized.source,
            externalId: normalized.externalId,
          });

        await this.repositories.metadata.upsert(
          postEntityId,
          normalized.metadata,
        );

        const blogExternalId = normalized.metadata.feedId;

        if (blogExternalId) {
          const blogTitle = subscriptionMap.get(blogExternalId);

          if (blogExternalId && blogTitle) {
            const { entityId: blogEntityId }
              = await this.repositories.entities.getOrCreateFromSource({
                kind: "blog",
                title: blogTitle,
                source: normalized.source,
                externalId: blogExternalId,
              });

            await this.repositories.relationships.createRelationship({
              parentId: blogEntityId,
              childId: postEntityId,
              type: "HAS_POST",
              parentKind: "blog",
              childKind: "post",
            });
          }
        }

        processed++;
      }

      this.progress.success(`Processed ${processed} "entries"`);

      await this.repositories.syncs.success(syncId, {
        blog_posts_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "entries": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
