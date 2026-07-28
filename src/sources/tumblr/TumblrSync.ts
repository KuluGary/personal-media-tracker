import type { EntityRepository } from "@/repositories/EntityRepository";
import type { MetadataRepository } from "@/repositories/MetadataRepository";
import type { RelationshipRepository } from "@/repositories/RelationshipRepository";
import type { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { TumblrClient } from "./TumblrClient";
import type { TumblrNormalizer } from "./TumblrNormalizer";

export class TumblrSync {
  constructor(
    private client: TumblrClient,
    private normalizer: TumblrNormalizer,
    private entities: EntityRepository,
    private metadata: MetadataRepository,
    private relationships: RelationshipRepository,
    private syncs: SourceSyncRepository,
  ) { }

  async run() {
    const syncId = await this.syncs.start("tumblr_posts");

    try {
      const posts = await this.client.fetchBlogPosts();

      let processed = 0;

      for (const post of posts) {
        const normalized = this.normalizer.normalizePost(post);

        const { entityId } = await this.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.metadata.upsert(entityId, normalized.metadata);

        processed++;
      }

      await this.syncs.success(syncId, {
        posts_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
