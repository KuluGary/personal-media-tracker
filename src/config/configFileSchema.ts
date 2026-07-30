import { z } from "zod";

import { freshRssSourceSchema } from "@/sources/freshrss/FreshRssSource";
import { mangaDexSourceSchema } from "@/sources/mangadex/MangadexSource";
import { pageboundSourceSchema } from "@/sources/pagebound/PageboundSource";
import { retroachievementsSourceSchema } from "@/sources/retroachievements/RetroachievementsSource";
import { steamSourceSchema } from "@/sources/steam/SteamSource";
import { traktSourceSchema } from "@/sources/trakt/TraktSource";
import { tumblrSourceSchema } from "@/sources/tumblr/TumblrSource";
import { youTubeSourceSchema } from "@/sources/youtube/YoutubeSource";

export const configFileSchema = z.object({
  database: z.object({
    url: z.string(),
    serviceKey: z.string(),
  }),

  sources: z.object({
    freshrss: freshRssSourceSchema.optional(),
    mangadex: mangaDexSourceSchema.optional(),
    pagebound: pageboundSourceSchema.optional(),
    retroachievements: retroachievementsSourceSchema.optional(),
    steam: steamSourceSchema.optional(),
    trakt: traktSourceSchema.optional(),
    tumblr: tumblrSourceSchema.optional(),
    youtube: youTubeSourceSchema.optional(),
  }),
});

export type ConfigFile = z.infer<typeof configFileSchema>;
