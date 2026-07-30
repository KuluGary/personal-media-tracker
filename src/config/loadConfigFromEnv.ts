import { env } from "node:process";

import { defined } from "@/utils/defined";

import type { AppConfig } from "./AppConfig";

export function loadConfigFromEnv(): AppConfig {
  return {
    database: {
      url: env.SUPABASE_URL!,
      serviceKey: env.SUPABASE_SERVICE_ROLE!,
    },

    sources: {
      pagebound: defined({
        userId: env.PAGEBOUND_USER_ID,
      }),
      tumblr: defined({
        consumerKey: env.TUMBLR_CONSUMER_KEY,
        blogIdentifier: env.TUMBLR_BLOG_IDENTIFIER,
      }),
      freshrss: defined({
        userName: env.FRESHRSS_USER_NAME,
        apiPassword: env.FRESHRSS_API_PASSWORD,
      }),
      mangadex: defined({
        clientId: env.MANGADEX_CLIENT_ID,
        clientSecret: env.MANGADEX_CLIENT_SECRET,
        password: env.MANGADEX_PASSWORD,
        userId: env.MANGADEX_USER_ID,
      }),
      trakt: defined({
        clientId: env.TRAKT_CLIENT_ID,
        userId: env.TRAKT_USER_ID,
      }),
      retroachievements: defined({
        apiKey: env.RETROACHIEVEMENTS_API_KEY,
        userId: env.RETROACHIEVEMENTS_USER_ID,
      }),
      youtube: defined({
        apiKey: env.YOUTUBE_API_KEY,
        clientId: env.YOUTUBE_CLIENT_ID,
        clientSecret: env.YOUTUBE_CLIENT_SECRET,
        refreshToken: env.YOUTUBE_REFRESH_TOKEN,
      }),
    },
  };
}
