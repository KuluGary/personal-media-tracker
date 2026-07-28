import { Client } from "tumblr.js";

import type { TumblrPost } from "./types";

export class TumblrClient {
  client: Client;

  constructor(
    private consumerKey: string,
    private blogIdentifier: string,
  ) {
    this.client = new Client({
      consumer_key: this.consumerKey,
    });
  }

  async fetchBlogPosts(): Promise<TumblrPost[]> {
    const limit = 20;
    let offset = 0;

    const allPosts: TumblrPost[] = [];

    while (true) {
      const response = await this.client.blogPosts(this.blogIdentifier, {
        type: "text",
        limit,
        offset,
      });

      allPosts.push(...response.posts);

      offset += response.posts.length;

      if (offset >= response.total_posts) {
        break;
      }
    }

    return allPosts;
  }
}
