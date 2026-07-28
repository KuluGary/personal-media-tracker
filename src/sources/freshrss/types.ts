export interface FreshRSSItem {
  id: string;
  crawlTimeMsec: string;
  timestampUsec: string;
  published: number;
  title: string;
  canonical: AlternateLink[];
  alternate: AlternateLink[];
  categories: string[];
  origin: Origin;
  summary: Content;
  author?: string;
}

export interface FreshRSSStreamResponse {
  id: string;
  updated: number;
  continuation?: string;
  items: FreshRSSItem[];
}

export interface AlternateLink {
  href: string;
  type?: string;
}

export interface Content {
  content: string;
  direction?: "ltr" | "rtl";
}

export interface Origin {
  streamId: string;
  title: string;
  htmlUrl?: string;
}

export interface Category {
  id: string;
  label?: string;
}

export interface FreshRSSSubscriptionCategory {
  id: string;
  label?: string;
}

export interface FreshRSSSubscription {
  id: string;
  title: string;
  htmlUrl?: string;
  categories?: FreshRSSSubscriptionCategory[];
}

export interface FreshRSSSubscriptionListResponse {
  subscriptions: FreshRSSSubscription[];
}

export interface FreshRSSNormalizedFeedItem {
  kind: "post";
  title: string;

  source: "freshrss";
  externalId: string;

  metadata: {
    url?: string;
    author?: string;
    published: string;
    feedId?: string;
    feedTitle?: string;
    summary?: string;
    categories?: string[];
  };
}

export interface FreshRSSNormalizedFeed {
  kind: "blog";
  title: string;

  source: "freshrss";
  externalId: string;

  metadata: {
    url?: string;
    categories?: string[];
  };
}
