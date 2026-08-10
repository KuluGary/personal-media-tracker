import type {
  YoutubePlaylistItem,
  YouTubePlaylistItemsResponse,
  YouTubeVideoRaw,
  YouTubeVideosResponse,
} from "./types";

/**
 * Provides methods to interact with the YouTube Web API for user and video data.
 */
export class YouTubeClient {
  /**
   * Creates a new YouTube API client.
   * @param apiKey YouTube API key
   */
  constructor(private readonly apiKey: string) {}

  async fetchPlaylistVideos(playlistId: string): Promise<YoutubePlaylistItem[]> {
    const playlistItemsUrl = "https://www.googleapis.com/youtube/v3/playlistItems";

    let nextPageToken: string | undefined;

    const playlistItems: YoutubePlaylistItem[] = [];

    do {
      const playlistParams = new URLSearchParams({
        part: "snippet",
        playlistId,
        maxResults: "50",
        pageToken: nextPageToken || "",
        key: this.apiKey,
      });

      const playlistRes = await fetch(`${playlistItemsUrl}?${playlistParams}`);

      if (!playlistRes.ok)
        throw new Error(`YouTube API error: ${playlistRes.status}`);

      const playlistJson = (await playlistRes.json()) as YouTubePlaylistItemsResponse;

      playlistItems.push(...(playlistJson.items || []));
      nextPageToken = playlistJson.nextPageToken;
    } while (nextPageToken);

    if (playlistItems.length === 0)
      return [];

    return playlistItems;
  }

  private async fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideoRaw[]> {
    const validIds = videoIds.filter(Boolean);
    const results: YouTubeVideoRaw[] = [];
    const batchSize = 50;

    for (let i = 0; i < validIds.length; i += batchSize) {
      const batchIds = validIds.slice(i, i + batchSize);
      const params = new URLSearchParams({
        key: this.apiKey,
        id: batchIds.join(","),
        part: "snippet,contentDetails",
        maxResults: String(batchIds.length),
      });

      const url = `https://www.googleapis.com/youtube/v3/videos?${params}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status}`);
      }

      const json = await res.json() as YouTubeVideosResponse;
      results.push(...(json.items || []).map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails,
        duration: item.contentDetails.duration,
      })));
    }

    return results;
  }
}
