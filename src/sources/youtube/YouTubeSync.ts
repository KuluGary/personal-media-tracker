import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { YouTubeClient } from "./YouTubeClient";
import type { YouTubeNormalizer } from "./YouTubeNormalizer";

export class YouTubeSync {
  constructor(
    private client: YouTubeClient,
    private normalizer: YouTubeNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  async run() {
    switch (this.request?.syncId) {
      case "playlist-items":
        return this.runSyncVideosFromPlaylist();

      default:
        return this.runSyncVideosFromPlaylist();
    }
  }

  private async runSyncVideosFromPlaylist() {
    const syncId = await this.repositories.syncs.start("youtube_playlist_items");

    this.progress.start("Fetching \"playlist items\"...");

    try {
      const playlistId = this.request?.params?.playlist;

      if (!playlistId) {
        throw new Error("Missing required parameter: --playlist");
      }

      const videos = await this.client.fetchPlaylistVideos(playlistId);

      let processed = 0;

      for (const video of videos) {
        const normalized = this.normalizer.normalizePlaylistItem(video);

        this.progress.update(`Fetching ${normalized.title}`);

        const { entityId: videoEntityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(videoEntityId, normalized.metadata);

        // Video → Channel
        if (normalized.metadata.channelId && normalized.metadata.channelTitle) {
          const { entityId: channelEntityId } = await this.repositories.entities.getOrCreateFromSource({
            kind: "subscription",
            title: normalized.metadata.channelTitle,
            source: normalized.source,
            externalId: normalized.metadata.channelId,
          });

          await this.repositories.relationships.createRelationship({
            parentId: channelEntityId,
            childId: videoEntityId,
            type: "HAS_SUBSCRIPTION",
            parentKind: "subscription",
            childKind: "video",
          });
        }

        // Video → Playlist
        if (normalized.metadata.playlistId && normalized.metadata.playlistTitle) {
          const { entityId: playlistEntityId } = await this.repositories.entities.getOrCreateFromSource({
            kind: "playlist",
            title: normalized.metadata.playlistTitle,
            source: normalized.source,
            externalId: normalized.metadata.playlistId,
          });

          await this.repositories.relationships.createRelationship({
            parentId: playlistEntityId,
            childId: videoEntityId,
            type: "HAS_PLAYLIST",
            parentKind: "playlist",
            childKind: "video",
          });
        }

        if (normalized.timeSeconds)
          await this.repositories.time?.recordTotalTime({ entityId: videoEntityId, totalSeconds: normalized.timeSeconds });

        processed++;
      }

      this.progress.success(`Processed ${processed} "playlist items"`);

      await this.repositories.syncs.success(syncId, {
        videos_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "playlist items": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
