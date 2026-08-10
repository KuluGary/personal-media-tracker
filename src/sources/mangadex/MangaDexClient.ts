import type { MangaDexFollowedMangaResponse, MangaDexManga } from "./types";

export class MangaDexClient {
  constructor(
    private userId: string,
    private password: string,
    private clientId: string,
    private clientSecret: string,
  ) { }

  async fetchFollowedManga(): Promise<MangaDexManga[]> {
    const headers = await this.authenticate();

    const baseUrl = "https://api.mangadex.org/user/follows/manga";

    const limit = 100;
    let offset = 0;
    let hasMore = true;

    const allData: MangaDexManga[] = [];

    while (hasMore) {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      params.append("includes[]", "cover_art");
      params.append("includes[]", "artist");
      params.append("includes[]", "author");
      params.append("includes[]", "manga");

      const url = `${baseUrl}?${params}`;

      const res = await fetch(`${url}?${params}`, { method: "GET", headers });

      if (!res.ok)
        throw new Error(`MangaDex API Error: ${res.status}`);

      const json = (await res.json()) as MangaDexFollowedMangaResponse;

      allData.push(...json.data);
      offset += limit;
      hasMore = json.total ? offset < json.total : json.data?.length === limit;
    }

    return allData;
  }

  private async authenticate() {
    const url = "https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token";

    const credentials = {
      grant_type: "password",
      username: this.userId,
      password: this.password,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };

    const body = new URLSearchParams(credentials);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const json = (await response.json()) as { access_token: string };

    if (!response)
      throw new Error("Error authenticating Mangadex");

    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${json.access_token}`,
      "Connection": "keep-alive",
    };
  }

  async validate() {
    await this.authenticate();
  }
}
