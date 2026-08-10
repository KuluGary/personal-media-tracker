export interface SteamOwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
  playtime_2weeks?: number;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
  rtime_last_played?: number;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  playtime_deck_forever?: number;
  playtime_disconnected?: number;
}

export interface SteamNormalizedGame {
  kind: "game";
  title: string;

  source: "steam";
  externalId: string;

  metadata: {
    platforms: string[];
    steam_appid: number;
  } & Record<string, any>;

  timeSeconds: number;
}

export interface SteamGetTopAchievementsForGamesItem {
  appid: number;
  total_achievements: number;
  achievements?: Array<SteamAchievement>;
}

export interface SteamAchievement {
  statid: number;
  bit: number;
  name: string;
  desc: string;
  icon: string;
  icon_gray: string;
  hidden: boolean;
  player_percent_unlocked: string;
}

export interface SteamNormalizedAchievement {
  kind: "achievement";
  title: string;
  source: "steam";
  externalId: string;
  metadata: {
    description: string | null;
    icon: string | null;
  } & Record<string, any>;
}

// --- Player Achievements (GetPlayerAchievements) ---
export interface SteamPlayerAchievement {
  apiname: string;
  achieved: number; // 1 if unlocked, 0 if not
  unlocktime: number; // unix timestamp, 0 if not unlocked
}

export interface SteamPlayerAchievementsResponse {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: SteamPlayerAchievement[];
    success: boolean;
  };
}

// --- Achievement Schema (GetSchemaForGame) ---
export interface SteamAchievementSchema {
  name: string; // apiname
  defaultvalue: number;
  displayName: string;
  hidden: number; // 1 if hidden, 0 if not
  description: string;
  icon: string;
  icongray: string;
}

export interface SteamAchievementSchemaResponse {
  game: {
    availableGameStats: {
      achievements: SteamAchievementSchema[];
    };
  };
}

// --- Combined Achievement (user + schema) ---
export interface SteamUserAchievementWithMetadata extends SteamPlayerAchievement {
  displayName: string;
  description: string | null;
  icon: string | null;
  iconGray: string | null;
  hidden: boolean;
}

export interface SteamPlayerSummariesResponse {
  response: {
    players: {
      steamid: string;
      personaname: string;
    }[];
  };
}
