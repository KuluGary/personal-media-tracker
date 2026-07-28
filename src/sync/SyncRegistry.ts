import { env } from "@/config/env";
import { db } from "@/db/supabase";
import { TrackableRepository } from "@/repositories/TrackableRepository";
import { FreshRSSClient } from "@/sources/freshrss/FreshRssClient";
import { FreshRSSNormalizer } from "@/sources/freshrss/FreshRssNormalizer";
import { FreshRSSSync } from "@/sources/freshrss/FreshRssSync";
import { MangaDexClient } from "@/sources/mangadex/MangaDexClient";
import { MangaDexNormalizer } from "@/sources/mangadex/MangaDexNormalizer";
import { MangaDexSync } from "@/sources/mangadex/MangaDexSync";
import { PageboundClient } from "@/sources/pagebound/PageboundClient";
import { PageboundNormalizer } from "@/sources/pagebound/PageboundNormalizer";
import { PageboundSync } from "@/sources/pagebound/PageboundSync";
import { RetroachievementsClient } from "@/sources/retroachievements/RetroachievementsClient";
import { RetroachievementsNormalizer } from "@/sources/retroachievements/RetroachievementsNormalizer";
import { RetroachievementsSync } from "@/sources/retroachievements/RetroachievementsSync";
import { SteamClient } from "@/sources/steam/SteamClient";
import { SteamNormalizer } from "@/sources/steam/SteamNormalizer";
import { TraktClient } from "@/sources/trakt/TraktClient";
import { TraktNormalizer } from "@/sources/trakt/TraktNormalizer";
import { TraktSync } from "@/sources/trakt/TraktSync";
import { TumblrClient } from "@/sources/tumblr/TumblrClient";
import { TumblrNormalizer } from "@/sources/tumblr/TumblrNormalizer";
import { TumblrSync } from "@/sources/tumblr/TumblrSync";
import { YouTubeClient } from "@/sources/youtube/YouTubeClient";
import { YouTubeNormalizer } from "@/sources/youtube/YouTubeNormalizer";
import { YouTubeSync } from "@/sources/youtube/YouTubeSync";

import { EntityRepository } from "../repositories/EntityRepository";
import { MetadataRepository } from "../repositories/MetadataRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import { SourceSyncRepository } from "../repositories/SourceSyncRepository";
import { TimeRepository } from "../repositories/TimeRepository";
import { SteamSync } from "../sources/steam/SteamSync";

export const syncRegistry: Record<string, () => Promise<{ run: () => Promise<void> }>> = {
  steam: async () => {
    const apiKey = env.STEAM_API_KEY;
    const steamId = env.STEAM_ID;

    if (!apiKey || !steamId) {
      throw new Error("Missing STEAM_API_KEY or STEAM_ID in .env");
    }
    const client = new SteamClient(apiKey, steamId);
    const normalizer = new SteamNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const time = new TimeRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new SteamSync(client, normalizer, entities, metadata, relationships, time, syncs);
  },
  retroachievements: async () => {
    const apiKey = env.RETROACHIEVEMENTS_API_KEY;
    const userId = env.RETROACHIEVEMENTS_USER_ID;

    if (!apiKey || !userId) {
      throw new Error("Missing RETROACHIEVEMENTS_API_KEY or RETROACHIEVEMENTS_USER_ID in .env");
    }
    const client = new RetroachievementsClient(apiKey, userId);
    const normalizer = new RetroachievementsNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new RetroachievementsSync(client, normalizer, entities, metadata, relationships, syncs);
  },
  youtube: async () => {
    const apiKey = env.YOUTUBE_API_KEY;
    const clientId = env.YOUTUBE_CLIENT_ID;
    const clientSecret = env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = env.YOUTUBE_REFRESH_TOKEN;

    if (!apiKey || !env.YOUTUBE_PLAYLIST_ID) {
      throw new Error("Missing YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_ID in .env");
    }

    const client = new YouTubeClient(apiKey, clientId, clientSecret, refreshToken);
    const normalizer = new YouTubeNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const time = new TimeRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new YouTubeSync(client, normalizer, entities, metadata, relationships, time, syncs);
  },
  trakt: async () => {
    const clientId = env.TRAKT_CLIENT_ID;
    const userId = env.TRAKT_USER_ID;

    if (!clientId || !userId) {
      throw new Error("Missing TRAKT_CLIENT_ID or TRAKT_USER_ID in .env");
    }

    const client = new TraktClient(clientId, userId);
    const normalizer = new TraktNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new TraktSync(client, normalizer, entities, metadata, relationships, syncs);
  },
  mangadex: async () => {
    const userId = env.MANGADEX_USER_ID;
    const password = env.MANGADEX_PASSWORD;
    const clientId = env.MANGADEX_CLIENT_ID;
    const clientSecret = env.MANGADEX_CLIENT_SECRET;

    if (!userId || !password || !clientId || !clientSecret) {
      throw new Error("Missing MANGADEX_USER_ID, MANGADEX_PASSWORD, MANGADEX_CLIENT_ID or MANGADEX_CLIENT_SECRET in .env");
    }

    const client = new MangaDexClient(userId, password, clientId, clientSecret);
    const normalizer = new MangaDexNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new MangaDexSync(client, normalizer, entities, metadata, relationships, syncs);
  },
  freshrss: async () => {
    const userName = env.FRESHRSS_USER_NAME;
    const apiPassword = env.FRESHRSS_API_PASSWORD;

    if (!userName || !apiPassword) {
      throw new Error("Missing FRESHRSS_USER_NAME or FRESHRSS_API_PASSWORD  in .env");
    }

    const client = new FreshRSSClient(userName, apiPassword);
    const normalizer = new FreshRSSNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new FreshRSSSync(client, normalizer, entities, metadata, relationships, syncs);
  },
  pagebound: async () => {
    const userId = env.PAGEBOUND_USER_ID;

    if (!userId) {
      throw new Error("Missing PAGEBOUND_USER_ID in .env");
    }

    const client = new PageboundClient(userId);
    const normalizer = new PageboundNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const trackable = new TrackableRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new PageboundSync(client, normalizer, entities, metadata, relationships, trackable, syncs);
  },
  tumblr: async () => {
    const consumerKey = env.TUMBLR_CONSUMER_KEY;
    const blogIdentifier = env.TUMBLR_BLOG_IDENTIFIER;

    if (!consumerKey || !blogIdentifier) {
      throw new Error("Missing TUMBLR_CONSUMER_KEY or TUMBLR_BLOG_IDENTIFIER in .env");
    }

    const client = new TumblrClient(consumerKey, blogIdentifier);
    const normalizer = new TumblrNormalizer();
    const entities = new EntityRepository(db);
    const metadata = new MetadataRepository(db);
    const relationships = new RelationshipRepository(db);
    const syncs = new SourceSyncRepository(db);

    return new TumblrSync(client, normalizer, entities, metadata, relationships, syncs);
  },
};
