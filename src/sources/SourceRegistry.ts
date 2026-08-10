import type { AppConfig } from "@/config/AppConfig";
import type { TrackerDatabase } from "@/db/types";

import type { SourceDefinition } from "./SourceDefinition";

import { FreshRSSSource } from "./freshrss/FreshRssSource";
import { HowLongToBeatSource } from "./howlongtobeat/HowLongToBeatSource";
import { MangaDexSource } from "./mangadex/MangadexSource";
import { PageboundSource } from "./pagebound/PageboundSource";
import { RetroachievementsSource } from "./retroachievements/RetroachievementsSource";
import { SteamSource } from "./steam/SteamSource";
import { TraktSource } from "./trakt/TraktSource";
import { TumblrSource } from "./tumblr/TumblrSource";
import { YouTubeSource } from "./youtube/YouTubeSource";

export function createSourceRegistry(config: AppConfig, db: TrackerDatabase) {
  return new SourceRegistry([
    new FreshRSSSource(config, db),
    new MangaDexSource(config, db),
    new PageboundSource(config, db),
    new RetroachievementsSource(config, db),
    new SteamSource(config, db),
    new TraktSource(config, db),
    new TumblrSource(config, db),
    new YouTubeSource(config, db),
    new HowLongToBeatSource(config, db),
  ]);
}

export class SourceRegistry {
  constructor(
    private readonly sources: SourceDefinition[],
  ) { }

  get(id: string) {
    return this.sources.find(source => source.id === id);
  }

  all() {
    return this.sources;
  }

  configured() {
    return this.sources.filter(source => source.hasConfiguration());
  }
}
