import type { AppConfig } from "@/config/AppConfig";

import type { SourceDefinition } from "./SourceDefinition";

import { FreshRSSSource } from "../freshrss/FreshRssSource";
import { MangaDexSource } from "../mangadex/MangadexSource";
import { PageboundSource } from "../pagebound/PageboundSource";
import { RetroachievementsSource } from "../retroachievements/RetroachievementsSource";
import { SteamSource } from "../steam/SteamSource";
import { TraktSource } from "../trakt/TraktSource";
import { TumblrSource } from "../tumblr/TumblrSource";
import { YouTubeSource } from "../youtube/YoutubeSource";

export function createSourceRegistry(config: AppConfig) {
  return new SourceRegistry([
    new FreshRSSSource(config),
    new MangaDexSource(config),
    new PageboundSource(config),
    new RetroachievementsSource(config),
    new SteamSource(config),
    new TraktSource(config),
    new TumblrSource(config),
    new YouTubeSource(config),
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
