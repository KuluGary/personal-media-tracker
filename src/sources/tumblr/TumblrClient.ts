import type { TumblrBlogInfoResponse, TumblrPost } from "./types";

/**
 * Provides methods to interact with the Tumblr Web API for user and blog data.
 */
export class TumblrClient {
  /**
   * Creates a new Tumblr API client.
   * @param consumerKey Tumblr API consumer key.
   * @param blogIdentifier Tumblr blog hostname or identifier.
   */
  constructor(
    private consumerKey: string,
    private blogIdentifier: string,
  ) { }

  /**
   * Fetches all text posts from the configured blog.
   * Internally paginates through the Tumblr API until all posts have been retrieved.
   */
  async fetchBlogPosts(tag?: string): Promise<TumblrPost[]> {
    const limit = 20;
    let offset = 0;

    const allPosts: TumblrPost[] = [];

    while (true) {
      const params = new URLSearchParams({
        api_key: this.consumerKey,
        type: "text",
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(
        `https://api.tumblr.com/v2/blog/${this.blogIdentifier}/posts?${params}`,
      );

      if (!response.ok) {
        throw new Error(`Tumblr API error: ${response.status}`);
      }

      const json = await response.json() as {
        response: {
          posts: TumblrPost[];
          total_posts: number;
        };
      };

      const fetchedPosts = json.response.posts;

      const posts = tag
        ? fetchedPosts.filter(post => post.tags?.includes(tag))
        : fetchedPosts;

      allPosts.push(...posts);

      offset += fetchedPosts.length;

      if (
        offset >= json.response.total_posts
        || fetchedPosts.length === 0
      ) {
        break;
      }
    }

    return allPosts;
  }

  /**
   * Verifies that the configured blog exists and that the API credentials are valid.
   */
  async validate() {
    await this.getBlogInfo();
  }

  /**
   * Retrieves metadata for the configured blog.
   * Throws if the blog does not exist or the API request fails.
   */
  private async getBlogInfo() {
    const url = `https://api.tumblr.com/v2/blog/${this.blogIdentifier}/info`;

    const params = new URLSearchParams({
      api_key: this.consumerKey,
    });

    const response = await fetch(`${url}?${params}`);

    switch (response.status) {
      case 200:
        break;

      case 401:
      case 403:
        throw new Error("Invalid Tumblr consumer key.");

      case 404:
        throw new Error("Tumblr blog not found.");

      default:
        throw new Error(`Unable to contact Tumblr (${response.status}).`);
    }

    const json = await response.json() as TumblrBlogInfoResponse;

    if (json.meta.status !== 200) {
      throw new Error(json.meta.msg);
    }

    return json.response.blog;
  }
}
