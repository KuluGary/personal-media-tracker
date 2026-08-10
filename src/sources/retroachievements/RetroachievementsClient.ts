import type { RetroachievementsAchievement, RetroachievementsGameProgress, RetroachievementsGameProgressResponse } from "./types";

/**
 * Provides methods to interact with the Retroachievements Web API for game and achievement data.
 */
export class RetroachievementsClient {
  /**
   * Creates a new RetroachievementsClient client.
   * @param apiKey Retroachievements API key.
   * @param userId The target username or ULID.
   */
  constructor(private apiKey: string, private userId: string) { }

  /**
   * Retrieves a given user's completion progress
   */
  async fetchGameProgress(): Promise<RetroachievementsGameProgress[]> {
    const url = "https://retroachievements.org/API/API_GetUserCompletionProgress.php";

    const params = new URLSearchParams({
      u: this.userId,
      y: this.apiKey,
    });

    const res = await fetch(`${url}?${params}`);

    if (!res.ok)
      throw new Error(`Retroachievements API Error: ${res.status}`);

    const json = (await res.json()) as RetroachievementsGameProgressResponse;

    return json.Results ?? [];
  }

  /**
   * Retrieves a list of achievements unlocked by a given user between two given dates
   * @param startDate Epoch timestamp. Time range start.
   * @param endDate Epoch timestamp. Time range end.
   */
  async fetchAchievementsBetween(startDate?: string, endDate?: string): Promise<RetroachievementsAchievement[]> {
    const url = "https://retroachievements.org/API/API_GetAchievementsEarnedBetween.php";

    const params = new URLSearchParams({
      u: this.userId,
      y: this.apiKey,
    });

    if (startDate)
      params.append("f", startDate);

    if (endDate)
      params.append("t", endDate);

    const res = await fetch(`${url}?${params}`);

    if (!res.ok)
      throw new Error(`Retroachievements API Error: ${res.status}`);

    const json = (await res.json()) as RetroachievementsAchievement[];

    return json ?? [];
  }

  /**
   * Verifies that the configured user exists and the API credentials are valid.
   */
  async validate() {
    await this.fetchUserProfile();
  }

  /**
   * Retrieves metadata for the configured user.
   * Throws if the user does not exist or the API request fails.
   */
  private async fetchUserProfile() {
    const url = "https://retroachievements.org/API/API_GetUserProfile.php";

    const params = new URLSearchParams({
      u: this.userId,
      y: this.apiKey,
    });

    const res = await fetch(`${url}?${params}`);

    if (!res.ok)
      throw new Error(`Retroachievements API Error: ${res.status}`);

    const json = await res.json();

    return json;
  }
}
