import type { SteamAchievementSchema, SteamAchievementSchemaResponse, SteamGame, SteamOwnedGamesResponse, SteamPlayerAchievementsResponse, SteamPlayerSummariesResponse, SteamUserAchievementWithMetadata } from "./types";

/**
 * Provides methods to interact with the Steam Web API for user and blog data.
 */
export class SteamClient {
  /**
   * Creates a new Steam API client.
   * @param apiKey Your Steam Web API key
   * @param steamId The user's SteamID64
   */
  constructor(
    private apiKey: string,
    private steamId: string,
  ) { }

  /**
   * Fetches the list of games owned by the user.
   */
  async fetchOwnedGames(): Promise<SteamGame[]> {
    const url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/";

    const params = new URLSearchParams({
      key: this.apiKey,
      steamid: this.steamId,
      include_appinfo: "true",
    });

    const res = await fetch(`${url}?${params}`);

    if (!res.ok)
      throw new Error(`Steam API error: ${res.status}`);

    const json = (await res.json()) as SteamOwnedGamesResponse;

    return json.response.games ?? [];
  }

  /**
   * Fetch unlocked achievements for a specific game, joined with schema metadata.
   * Only achievements the user has unlocked are returned.
   */
  async fetchUserAchievementsWithMetadata(appid: number): Promise<SteamUserAchievementWithMetadata[]> {
    const [playerstats, schema] = await Promise.all([
      this.fetchUserAchievements(appid),
      this.fetchAchievementSchema(appid),
    ]);

    if (!playerstats || !playerstats.achievements || !Array.isArray(playerstats.achievements))
      return [];

    return playerstats.achievements.filter(a => a.achieved === 1).map((userAch): SteamUserAchievementWithMetadata => {
      const meta = schema.find(s => s.name === userAch.apiname);

      return {
        ...userAch,
        displayName: meta?.displayName ?? userAch.apiname,
        description: meta?.description ?? null,
        icon: meta?.icon ?? null,
        iconGray: meta?.icongray ?? null,
        hidden: meta ? !!meta.hidden : false,
      };
    });
  }

  /**
   * Resolves a user's Steam ID given a profile URL or vanity user profile URL.
   */
  async resolveSteamId(input: string): Promise<string> {
    const steamIdRegex = /^\d{17}$/;

    if (steamIdRegex.test(input)) {
      return input;
    }

    const profileMatch = input.match(
      /^https?:\/\/steamcommunity\.com\/profiles\/(\d{17})\/?$/i,
    );

    if (profileMatch?.[1]) {
      return profileMatch[1];
    }

    const vanityMatch = input.match(
      /^https?:\/\/steamcommunity\.com\/id\/([^/]+)\/?$/i,
    );

    if (vanityMatch?.[1]) {
      return this.resolveVanityUrl(vanityMatch[1]);
    }

    throw new Error("Invalid Steam profile URL or Steam ID.");
  }

  /**
   * Verifies that the configured user exists and that the API credentials are valid.
   */
  async validate() {
    const players = await this.getPlayerSummaries();

    if (players.length === 0) {
      throw new Error("Steam profile not found.");
    }
  }

  /**
   * Retrieves the user's achievement status for a specific game.
   */
  private async fetchUserAchievements(appid: number): Promise<SteamPlayerAchievementsResponse["playerstats"] | null> {
    const url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/";

    const params = new URLSearchParams({
      key: this.apiKey,
      steamid: this.steamId,
      appid: String(appid),
    });

    const res = await fetch(`${url}?${params}`);

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as SteamPlayerAchievementsResponse;
    return json.playerstats;
  }

  /**
   * Retrieve the full list of stats and achievements for a specific game
   */
  private async fetchAchievementSchema(appid: number): Promise<SteamAchievementSchema[]> {
    const url = "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";

    const params = new URLSearchParams({
      key: this.apiKey,
      appid: String(appid),
    });

    const res = await fetch(`${url}?${params}`);

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as SteamAchievementSchemaResponse;
    return json.game?.availableGameStats?.achievements ?? [];
  }

  /**
   * Retrieves metadata for the configured user.
   * Throws if the user does not exist or the API request fails.
   */
  private async getPlayerSummaries() {
    const url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

    const params = new URLSearchParams({
      key: this.apiKey,
      steamids: this.steamId,
    });

    const response = await fetch(`${url}?${params}`);

    if (response.status === 403) {
      throw new Error("Invalid Steam API key.");
    }

    if (!response.ok) {
      throw new Error(`Unable to contact Steam (${response.status}).`);
    }

    const json = await response.json() as SteamPlayerSummariesResponse;

    if (json.response.players.length === 0) {
      throw new Error("Steam profile not found.");
    }

    return json.response.players;
  }

  /**
   * Resolves a vanity URL into its assigned Steam ID.
   */
  private async resolveVanityUrl(vanity: string): Promise<string> {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?${new URLSearchParams({
        key: this.apiKey,
        vanityurl: vanity,
      })}`,
    );

    if (!response.ok) {
      throw new Error("Unable to contact Steam.");
    }

    const json = await response.json() as {
      response: {
        success: number;
        steamid?: string;
        message?: string;
      };
    };

    if (json.response.success !== 1 || !json.response.steamid) {
      throw new Error("Steam profile not found.");
    }

    return json.response.steamid;
  }
}
