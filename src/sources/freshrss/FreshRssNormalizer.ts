import type { FreshRSSItem, FreshRSSNormalizedFeed, FreshRSSNormalizedFeedItem, FreshRSSSubscription } from "./types";

export class FreshRSSNormalizer {
  normalizeBlogPost(feedItem: FreshRSSItem): FreshRSSNormalizedFeedItem {
    return {
      kind: "post",
      title: feedItem.title,

      source: "freshrss",
      externalId: String(feedItem.id),

      metadata: {
        url: this.getUrl(feedItem),
        author: feedItem.author ?? feedItem.origin.htmlUrl,
        published: String(feedItem.published),
        summary: feedItem.summary?.content,
        categories: feedItem.categories?.map(category => category),
        feedId: feedItem.origin?.streamId,
        feedTitle: feedItem.origin?.title,
      },
    };
  }

  normalizeBlog(feed: FreshRSSSubscription): FreshRSSNormalizedFeed {
    return {
      kind: "blog",
      title: feed.title,

      source: "freshrss",
      externalId: String(feed.id),

      metadata: {
        url: feed.htmlUrl,
        categories: feed.categories?.map(category => category.label ?? category.id),
      },
    };
  }

  private getUrl(feedItem: FreshRSSItem): string | undefined {
    if (feedItem.canonical && feedItem.canonical.length > 0) {
      return feedItem.canonical[0]?.href;
    }
    else if (feedItem.alternate && feedItem.alternate.length > 0) {
      return feedItem.alternate[0]?.href;
    }

    return undefined;
  }
}
