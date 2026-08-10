import type { HowLongToBeatNormalizedGame, HowLongToBeatRawGame } from "./types";

export class HowLongToBeatNormalizer {
  normalizeGame(game: HowLongToBeatRawGame): HowLongToBeatNormalizedGame {
    return {
      kind: "game",
      title: game.custom_title,

      externalId: game.game_id.toString(),
      metadata: {
        platforms: [game.platform],
      },
      source: "howlongtobeat",
    };
  }
}
