import type { SteamGame, SteamNormalizedAchievement, SteamNormalizedGame, SteamUserAchievementWithMetadata } from "./types";

/**
 * Transforms Steam API entities into canonical domain entities.
 */
export class SteamNormalizer {
  /**
   * Converts a Steam game into the application's canonical game representation.
   */
  normalizeGame(game: SteamGame): SteamNormalizedGame {
    return {
      kind: "game",
      title: game.name,

      source: "steam",
      externalId: String(game.appid),

      metadata: {
        platforms: ["PC"],
        steam_appid: game.appid,
        icons: {
          "32x32": game.img_icon_url
            ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
            : null,
          "184x69": `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_184x69.jpg`,
        },
        lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : null,
      },

      timeSeconds: game.playtime_forever * 60,
    };
  }

  /**
   * Converts a Steam achievement into the application's canonical achievement representation.
   */
  normalizeAchievement(achievement: SteamUserAchievementWithMetadata): SteamNormalizedAchievement {
    return {
      kind: "achievement",
      title: achievement.displayName,

      source: "steam",
      externalId: String(achievement.apiname),

      metadata: {
        description: achievement.description,
        icon: achievement.icon,
        dateUnlocked: achievement.unlocktime ?? null,
      },

    };
  }
}
