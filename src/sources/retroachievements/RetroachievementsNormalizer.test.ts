import { describe, expect, it } from "vitest";

import { RetroachievementsNormalizer } from "./RetroachievementsNormalizer";

describe("retroachievements normalizer", () => {
  const normalizer = new RetroachievementsNormalizer();

  it("normalizes games into canonical game entities", () => {
    const result = normalizer.normalizeGame({
      GameID: 800,
      Title: "Wario Land 4",
      ImageIcon: "/Images/112286.png",
      ConsoleID: 5,
      ConsoleName: "Game Boy Advance",
      MaxPossible: 66,
      NumAwarded: 9,
      NumAwardedHardcore: 9,
      MostRecentAwardedDate: "2026-03-22T20:30:14+00:00",
      HighestAwardKind: null,
      HighestAwardDate: null,
    });

    expect(result).toStrictEqual({
      kind: "game",
      title: "Wario Land 4",
      source: "retroachievements",
      externalId: "800",

      metadata: {
        platforms: ["Game Boy Advance"],
        gameId: 800,
        consoleId: 5,
        achievementsUnlocked: 9,
        achievementsTotal: 66,
        icons: {
          "96x96": "https://media.retroachievements.org/Images/112286.png",
        },
        lastPlayed: "2026-03-22T20:30:14+00:00",
      },
    });
  });

  it("normalizes game achievements into canonical achievement entities", () => {
    const result = normalizer.normalizeAchievement({
      Date: "2026-01-07 20:35:54",
      HardcoreMode: 1,
      AchievementID: 11898,
      Title: "Kirbyendo",
      Description: "Transform into Beam Kirby.",
      BadgeName: "185847",
      Points: 1,
      TrueRatio: 1,
      Type: null,
      Author: "Rewsifer",
      AuthorULID: "018SZCHAAG1HR6BCNC2NDMR7TV",
      GameTitle: "Kirby: Nightmare in Dream Land",
      GameIcon: "/Images/122187.png",
      GameID: 770,
      ConsoleName: "Game Boy Advance",
      CumulScore: 1,
      BadgeURL: "/Badge/185847.png",
      GameURL: "/game/770",
    });

    expect(result).toEqual({
      kind: "achievement",
      title: "Kirbyendo",
      source: "retroachievements",
      externalId: "11898",
      metadata: {
        achievementId: 11898,
        gameId: 770,
        gameTitle: "Kirby: Nightmare in Dream Land",
        points: 1,
        dateUnlocked: "2026-01-07 20:35:54",
        icon: "https://media.retroachievements.org/Badge/185847.png",
      },
    });
  });
});
