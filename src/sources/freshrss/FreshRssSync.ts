import type { EntityRepository } from "@/repositories/EntityRepository";
import type { MetadataRepository } from "@/repositories/MetadataRepository";
import type { RelationshipRepository } from "@/repositories/RelationshipRepository";
import type { SourceSyncRepository } from "@/repositories/SourceSyncRepository";

import type { FreshRSSClient } from "./FreshRssClient";
import type { FreshRSSNormalizer } from "./FreshRssNormalizer";
import type { FreshRSSSubscription } from "./types";

export class FreshRSSSync {
  constructor(
    private client: FreshRSSClient,
    private normalizer: FreshRSSNormalizer,
    private entities: EntityRepository,
    private metadata: MetadataRepository,
    private relationships: RelationshipRepository,
    private syncs: SourceSyncRepository,
  ) { }

  async run() {
    const blogs = await this.runFollowingBlogs();
    await this.runFavouriteBlogPosts(blogs);
  }

  async runFollowingBlogs(): Promise<FreshRSSSubscription[]> {
    const syncId = await this.syncs.start("freshrss_blogs");

    try {
      const blogs = await this.client.fetchFollowingBlogs();

      let processed = 0;

      for (const blog of blogs) {
        const normalized = this.normalizer.normalizeBlog(blog);

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
        blogs_processed: processed,
      });

      return blogs;
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  async runFavouriteBlogPosts(blogs: FreshRSSSubscription[]) {
    const syncId = await this.syncs.start("freshrss_blog_posts");

    try {
      const latestPostDateStr
        = await this.entities.getLatestCreatedAt("post");

      let updatedAfter: number | undefined;

      if (latestPostDateStr) {
        updatedAfter = Math.floor(
          new Date(latestPostDateStr).getTime() / 1000,
        );
      }

      const posts = await this.client.fetchFavouriteBlogPosts(
        blogs,
        updatedAfter,
      );

      const blogMap = new Map(
        blogs.map(b => [b.id, b.title]),
      );

      let processed = 0;

      for (const post of posts) {
        const normalized = this.normalizer.normalizeBlogPost(post);

        const { entityId: postEntityId }
          = await this.entities.getOrCreateFromSource({
            kind: normalized.kind,
            title: normalized.title,
            source: normalized.source,
            externalId: normalized.externalId,
          });

        await this.metadata.upsert(
          postEntityId,
          normalized.metadata,
        );

        const blogExternalId = normalized.metadata.feedId;

        if (blogExternalId) {
          const blogTitle = blogMap.get(blogExternalId);

          if (blogExternalId && blogTitle) {
            const { entityId: blogEntityId }
              = await this.entities.getOrCreateFromSource({
                kind: "blog",
                title: blogTitle,
                source: normalized.source,
                externalId: blogExternalId,
              });

            await this.relationships.createRelationship({
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

      await this.syncs.success(syncId, {
        blog_posts_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
