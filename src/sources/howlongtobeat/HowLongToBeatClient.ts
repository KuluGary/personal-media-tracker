import axios from "axios";

import type { HowLongToBeatListResponse, HowLongToBeatRawGame } from "./types";

export class HowLongToBeatClient {
  constructor(
    private userId: string,
  ) {}

  async fetchBacklogGames() {
    return await this.fetchGamesFromList("backlog");
  }

  async fetchPlayingGames() {
    return await this.fetchGamesFromList("playing");
  }

  async fetchFavouriteGames() {
    return await this.fetchGamesFromList("custom");
  }

  async fetchPlayedGames() {
    return await this.fetchGamesFromList("custom2");
  }

  async fetchCompletedGames() {
    return await this.fetchGamesFromList("completed");
  }

  async fetchRetiredGames() {
    return await this.fetchGamesFromList("retired");
  }

  private async fetchGamesFromList(
    list: string,
  ): Promise<HowLongToBeatRawGame[]> {
    const url = `https://howlongtobeat.com/api/user/${this.userId}/games/list`;

    const body = {
      user_id: this.userId,
      toggleType: "Single List",
      lists: [list],
      set_playstyle: "comp_all",
      name: "",
      platform: "",
      storefront: "",
      sortBy: "",
      sortFlip: 0,
      view: "",
      random: 0,
      limit: 500,
      currentUserHome: true,
    };

    const { data } = await axios.post<HowLongToBeatListResponse>(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "bruno-runtime/4.0.0",
          "Cookie":
          "hltb_view_list=%7B%22playing%22%3A%22-%22%2C%22backlog%22%3A%22-%22%2C%22replays%22%3A%22-%22%2C%22custom%22%3A%22-%22%2C%22custom2%22%3A%22-%22%2C%22custom3%22%3A%22-%22%2C%22completed%22%3A%22-%22%2C%22retired%22%3A%22-%22%7D",
        },
      },
    );

    return data.data.gamesList;
  }
}
