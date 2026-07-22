export interface RetroachievementsGameProgressResponse {
  Count: number;
  Total: number;
  Results: RetroachievementsGameProgress[];
}

export interface RetroachievementsGameProgress {
  GameID: number;
  Title: string;
  ImageIcon: string;
  ConsoleID: number;
  ConsoleName: string;
  MaxPossible: number;
  NumAwarded: number;
  NumAwardedHardcore: number;
  MostRecentAwardedDate: string;
  HighestAwardKind: string | null;
  HighestAwardDate: string | null;
}

export interface RetroachievementsNormalizedGame {
  kind: "game";
  title: string;

  source: "retroachievements";
  externalId: string;

  metadata: {
    platforms: string[];
    gameId: number;
    consoleId: number;
    achievementsUnlocked: number;
    achievementsTotal: number;
  } & Record<string, any>;

  timeSeconds?: number;
}

export interface RetroachievementsAchievement {
  Date: string;
  HardcoreMode: number;
  AchievementID: number;
  Title: string;
  Description: string;
  BadgeName: string;
  Points: number;
  TrueRatio: number;
  Type: string;
  Author: string;
  AuthorULID: string;
  GameTitle: string;
  GameIcon: string;
  GameID: number;
  ConsoleName: string;
  CumulScore: number;
  BadgeURL: string;
  GameURL: string;
}

export interface RetroachievementsUnlocksByDateRange {
  Date: string;
  HardcoreMode: number;
  AchievementID: number;
  Title: string;
  Description: string;
  BadgeName: string;
  Points: number;
  TrueRatio: number;
  Type: string | null;
  Author: string;
  AuthorULID: string;
  GameTitle: string;
  GameIcon: string;
  GameID: number;
  ConsoleName: string;
  CumulScore: number;
  BadgeURL: string;
  GameURL: string;
}

export interface RetroachievementsNormalizedAchiement {
  kind: "achievement";
  title: string;

  source: "retroachievements";
  externalId: string;

  metadata: {
    achievementId: number;
    gameId: number;
    gameTitle: string;
    points: number;
    dateUnlocked: string;
  } & Record<string, any>;
}
