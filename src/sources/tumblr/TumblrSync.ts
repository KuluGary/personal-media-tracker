import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { TumblrClient } from "./TumblrClient";
import type { TumblrNormalizer } from "./TumblrNormalizer";

/**
 * Synchronizes Tumblr posts into the application's canonical data model.
 *
 * Retrieves posts from Tumblr, normalizes them, persists entities and metadata,
 * and records the outcome of the synchronization.
 */
export class TumblrSync {
  constructor(
    private client: TumblrClient,
    private normalizer: TumblrNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  /**
   * Synchronizes all posts from the configured Tumblr blog.
   *
   * Throws if the synchronization fails.
   */
  async run() {
    const syncId = await this.repositories.syncs.start("tumblr_posts");

    this.progress.start("Fetching \"posts\"...");

    try {
      const posts = await this.client.fetchBlogPosts();

      let processed = 0;

      for (const post of posts) {
        const normalized = this.normalizer.normalizePost(post);

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

      this.progress.success(`Processed ${processed} "posts"`);

      await this.repositories.syncs.success(syncId, {
        posts_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "posts": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
