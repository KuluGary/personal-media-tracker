import type { TumblrNormalizedPost, TumblrPost } from "./types";

/**
 * Transforms Tumblr API entities into canonical domain entities.
 */
export class TumblrNormalizer {
  /**
   * Converts a Tumblr post into the application's canonical post representation.
   */
  normalizePost(post: TumblrPost): TumblrNormalizedPost {
    return {
      kind: "post",
      title: post.title ?? post.blog_name,

      source: "tumblr",
      externalId: post.id_string,

      metadata: {
        url: post.post_url,
        date: post.date,
        tags: post.tags,
        type: post.type,
        content: post.body,
        summary: post.summary,
      },
    };
  }
}
