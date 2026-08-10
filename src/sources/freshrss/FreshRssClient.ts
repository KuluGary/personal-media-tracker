import type {
  FreshRSSItem,
  FreshRSSStreamResponse,
  FreshRSSSubscription,
  FreshRSSSubscriptionListResponse,
} from "./types";

/**
 * Provides methods to interact with the FreshRSS Web API for user and book data.
 */
export class FreshRSSClient {
  constructor(
    private userName: string,
    private apiPassword: string,
  ) { }

  private base = "https://rss.32bit.cafe/api/greader.php";

  private authToken?: string;

  async fetchSubscriptions(tag?: string): Promise<FreshRSSSubscription[]> {
    const auth = await this.getAuthToken();

    const url
      = `${this.base}/reader/api/0/subscription/list?output=json`;

    const res = await fetch(url, {
      headers: {
        Authorization: `GoogleLogin auth=${auth}`,
      },
    });

    if (!res.ok) {
      throw new Error(`FreshRSS API Error: ${res.status}`);
    }

    const json
      = (await res.json()) as FreshRSSSubscriptionListResponse;

    const subscriptions = json.subscriptions ?? [];

    if (!tag)
      return subscriptions;

    return subscriptions.filter(sub =>
      sub.categories?.some(c => c.id === tag),
    );
  }

  async fetchStarredEntries(
    blogs: FreshRSSSubscription[],
    updatedAfter?: number,
  ): Promise<FreshRSSItem[]> {
    const auth = await this.getAuthToken();

    const blogIds = new Set(blogs.map(b => b.id));

    let continuation: string | undefined;
    const posts: FreshRSSItem[] = [];

    do {
      const url = new URL(
        `${this.base}/reader/api/0/stream/contents/user/-/state/com.google/starred`,
      );

      url.searchParams.set("n", "100");

      if (continuation) {
        url.searchParams.set("continuation", continuation);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `GoogleLogin auth=${auth}`,
        },
      });

      if (!res.ok) {
        throw new Error(`FreshRSS API Error: ${res.status}`);
      }

      const json = (await res.json()) as FreshRSSStreamResponse;

      const items = json.items ?? [];

      for (const item of items) {
        const streamId = item.origin?.streamId;

        if (!streamId || !blogIds.has(streamId))
          continue;

        if (updatedAfter && item.published <= updatedAfter)
          continue;

        posts.push(item);
      }

      continuation = json.continuation;
    } while (continuation);

    return posts;
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken)
      return this.authToken;

    const body = new URLSearchParams({
      Email: this.userName,
      Passwd: this.apiPassword,
    });

    const res = await fetch(`${this.base}/accounts/ClientLogin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const body = await res.text();

      throw new Error(
        `FreshRSS login failed (${res.status}): ${body}`,
      );
    }

    const text = await res.text();

    const match = text.match(/Auth=(.*)/);

    if (!match) {
      throw new Error("FreshRSS auth token missing");
    }

    this.authToken = match[1]?.trim();

    return this.authToken ?? "";
  }

  async validate() {
    await this.getAuthToken();
  }
}
