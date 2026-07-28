import type { EntityRepository } from "@/repositories/EntityRepository";
import type { MetadataRepository } from "@/repositories/MetadataRepository";
import type { RelationshipRepository } from "@/repositories/RelationshipRepository";
import type { SourceSyncRepository } from "@/repositories/SourceSyncRepository";
import type { TimeRepository } from "@/repositories/TimeRepository";

import { env } from "@/config/env";

import type { YouTubeClient } from "./YouTubeClient";
import type { YouTubeNormalizer } from "./YouTubeNormalizer";

export class YouTubeSync {
  constructor(
    private client: YouTubeClient,
    private normalizer: YouTubeNormalizer,
    private entities: EntityRepository,
    private metadata: MetadataRepository,
    private relationships: RelationshipRepository,
    private time: TimeRepository,
    private syncs: SourceSyncRepository,
  ) { }

  async run() {
    await this.runSyncVideosFromPlaylist();
    await this.tryRunOAuthGatedSyncs();
  }

  private async tryRunOAuthGatedSyncs() {
    const oauthSyncs = [
      () => this.runChannelSubscriptions(),
      () => this.runSyncFavouriteVideos(),
    ];

    for (const runOAuthSync of oauthSyncs) {
      try {
        await runOAuthSync();
      }
      catch (error) {
        console.warn("Secondary YouTube OAuth sync failed:", error);
      }
    }
  }

  private async runChannelSubscriptions() {
    const syncId = await this.syncs.start("youtube_subscriptions");

    try {
      const subscriptions = await this.client.fetchChannelSubscriptions();

      let processed = 0;

      for (const subscription of subscriptions) {
        const normalized = this.normalizer.normalizeChannelSubscription(subscription);

        const { entityId } = await this.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.metadata.upsert(entityId, normalized.metadata);

        processed++;
      }

      await this.syncs.success(syncId, {
        subscriptions_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  private async runPlaylists() {
    const syncId = await this.syncs.start("youtube_playlists");

    try {
      const playlists = await this.client.fetchPlaylists();

      let processed = 0;

      for (const playlist of playlists) {
        const normalize = this.normalizer.normalizePlaylist(playlist);

        const { entityId: playlistEntityId } = await this.entities.getOrCreateFromSource({
          kind: normalize.kind,
          title: normalize.title,
          source: normalize.source,
          externalId: normalize.externalId,
        });

        await this.metadata.upsert(playlistEntityId, normalize.metadata);

        if (normalize.metadata.channelId && normalize.metadata.channelTitle) {
          const { entityId: channelEntityId } = await this.entities.getOrCreateFromSource({
            kind: "subscription",
            title: normalize.metadata.channelTitle,
            source: normalize.source,
            externalId: normalize.metadata.channelId,
          });
          await this.relationships.createRelationship({
            parentId: channelEntityId,
            childId: playlistEntityId,
            type: "HAS_SUBSCRIPTION",
            parentKind: "subscription",
            childKind: "playlist",
          });
        }

        processed++;
      }

      await this.syncs.success(syncId, {
        playlists_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  private async runSyncFavouriteVideos() {
    const syncId = await this.syncs.start("youtube_favourite_videos");

    try {
      const videos = await this.client.fetchFavouriteVideos();

      let processed = 0;

      for (const video of videos) {
        const normalize = this.normalizer.normalizeVideo(video);

        const { entityId: videoEntityId } = await this.entities.getOrCreateFromSource({
          kind: normalize.kind,
          title: normalize.title,
          source: normalize.source,
          externalId: normalize.externalId,
        });

        await this.metadata.upsert(videoEntityId, normalize.metadata);

        if (normalize.metadata.channelId && normalize.metadata.channelTitle) {
          const res = await this.entities.getFromSource({
            source: normalize.source,
            externalId: normalize.metadata.channelId,
          });

          if (res?.entityId) {
            await this.relationships.createRelationship({
              parentId: res.entityId,
              childId: videoEntityId,
              type: "HAS_SUBSCRIPTION",
              parentKind: "subscription",
              childKind: "video",
            });
          }
        }

        processed++;
      }

      await this.syncs.success(syncId, {
        videos_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  private async runSyncVideosFromPlaylist() {
    const syncId = await this.syncs.start("youtube");

    try {
      const videos = await this.client.fetchPlaylistVideos(env.YOUTUBE_PLAYLIST_ID);

      let processed = 0;

      for (const video of videos) {
        const normalize = this.normalizer.normalizePlaylistItem(video);

        const { entityId: videoEntityId } = await this.entities.getOrCreateFromSource({
          kind: normalize.kind,
          title: normalize.title,
          source: normalize.source,
          externalId: normalize.externalId,
        });

        await this.metadata.upsert(videoEntityId, normalize.metadata);

        // Video → Channel
        if (normalize.metadata.channelId && normalize.metadata.channelTitle) {
          const { entityId: channelEntityId } = await this.entities.getOrCreateFromSource({
            kind: "subscription",
            title: normalize.metadata.channelTitle,
            source: normalize.source,
            externalId: normalize.metadata.channelId,
          });

          await this.relationships.createRelationship({
            parentId: channelEntityId,
            childId: videoEntityId,
            type: "HAS_SUBSCRIPTION",
            parentKind: "subscription",
            childKind: "video",
          });
        }

        // Video → Playlist
        if (normalize.metadata.playlistId && normalize.metadata.playlistTitle) {
          const { entityId: playlistEntityId } = await this.entities.getOrCreateFromSource({
            kind: "playlist",
            title: normalize.metadata.playlistTitle,
            source: normalize.source,
            externalId: normalize.metadata.playlistId,
          });

          await this.relationships.createRelationship({
            parentId: playlistEntityId,
            childId: videoEntityId,
            type: "HAS_PLAYLIST",
            parentKind: "playlist",
            childKind: "video",
          });
        }

        if (normalize.timeSeconds)
          await this.time.recordTotalTime({ entityId: videoEntityId, totalSeconds: normalize.timeSeconds });

        processed++;
      }

      await this.syncs.success(syncId, {
        videos_processed: processed,
      });
    }
    catch (e) {
      await this.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
