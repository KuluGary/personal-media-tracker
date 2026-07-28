import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

// eslint-disable-next-line no-console
console.log("🔐 Loading environment variables...");

const envValue = z.preprocess(value => typeof value === "string" ? value.trim() : value, z.string().min(1));

const serverSchema = z.object({
  // SUPABASE
  SUPABASE_URL: envValue,
  SUPABASE_SERVICE_ROLE: envValue,

  // YOUTUBE
  YOUTUBE_PLAYLIST_ID: envValue,
  YOUTUBE_API_KEY: envValue,
  YOUTUBE_CLIENT_ID: envValue.optional(),
  YOUTUBE_CLIENT_SECRET: envValue.optional(),
  YOUTUBE_REFRESH_TOKEN: envValue.optional(),

  // RETROACHIEVEMENTS
  RETROACHIEVEMENTS_API_KEY: envValue.optional(),
  RETROACHIEVEMENTS_USER_ID: envValue.optional(),

  // TRAKT
  TRAKT_CLIENT_ID: envValue.optional(),
  TRAKT_USER_ID: envValue.optional(),

  // MANGADEX
  MANGADEX_USER_ID: envValue.optional(),
  MANGADEX_PASSWORD: envValue.optional(),
  MANGADEX_CLIENT_ID: envValue.optional(),
  MANGADEX_CLIENT_SECRET: envValue.optional(),

  // STEAM
  STEAM_API_KEY: envValue.optional(),
  STEAM_ID: envValue.optional(),

  // SteamGridDB
  STEAMGRIDDB_API_KEY: envValue.optional(),

  // FRESRSS
  FRESHRSS_USER_NAME: envValue.optional(),
  FRESHRSS_API_PASSWORD: envValue.optional(),
  FRESHRSS_CATEGORY_NAME: envValue.optional(),

  // PAGEBOUND
  PAGEBOUND_USER_ID: envValue.optional(),

  // TUMBLR
  TUMBLR_CONSUMER_KEY: envValue.optional(),
  TUMBLR_BLOG_IDENTIFIER: envValue.optional(),
});

// eslint-disable-next-line node/no-process-env
const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
  console.error("❌ Invalid environment variables:\n");
  _serverEnv.error.issues.forEach((issue) => {
    console.error(issue);
  });
  throw new Error("Invalid environment variables");
}

const {
  SUPABASE_SERVICE_ROLE,
  SUPABASE_URL,
  MANGADEX_CLIENT_ID,
  MANGADEX_CLIENT_SECRET,
  MANGADEX_PASSWORD,
  MANGADEX_USER_ID,
  YOUTUBE_API_KEY,
  YOUTUBE_PLAYLIST_ID,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REFRESH_TOKEN,
  STEAM_API_KEY,
  STEAM_ID,
  STEAMGRIDDB_API_KEY,
  RETROACHIEVEMENTS_API_KEY,
  RETROACHIEVEMENTS_USER_ID,
  TRAKT_CLIENT_ID,
  TRAKT_USER_ID,
  FRESHRSS_USER_NAME,
  FRESHRSS_API_PASSWORD,
  FRESHRSS_CATEGORY_NAME,
  PAGEBOUND_USER_ID,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_BLOG_IDENTIFIER,
} = _serverEnv.data;

export const env = {
  SUPABASE_SERVICE_ROLE,
  SUPABASE_URL,
  MANGADEX_CLIENT_ID,
  MANGADEX_CLIENT_SECRET,
  MANGADEX_PASSWORD,
  MANGADEX_USER_ID,
  YOUTUBE_PLAYLIST_ID,
  YOUTUBE_API_KEY,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REFRESH_TOKEN,
  STEAM_API_KEY,
  STEAM_ID,
  STEAMGRIDDB_API_KEY,
  RETROACHIEVEMENTS_API_KEY,
  RETROACHIEVEMENTS_USER_ID,
  TRAKT_CLIENT_ID,
  TRAKT_USER_ID,
  FRESHRSS_API_PASSWORD,
  FRESHRSS_USER_NAME,
  FRESHRSS_CATEGORY_NAME,
  PAGEBOUND_USER_ID,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_BLOG_IDENTIFIER,
};

// eslint-disable-next-line no-console
console.log("✅ Environment variables loaded");
