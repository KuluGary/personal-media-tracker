import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { SteamClient } from "./SteamClient";
import type { SteamNormalizer } from "./SteamNormalizer";

import { STEAM_SYNCS } from "./SteamSource";

/**
 * Synchronizes Steam data into the application's canonical data model.
 *
 * Retrieves data from Steam, normalizes it, persists entities and metadata
 * and records the outcome of the synchronization
 */
export class SteamSync {
  constructor(
    private client: SteamClient,
    private normalizer: SteamNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  async run() {
    switch (this.request?.syncId) {
      case STEAM_SYNCS.GAMES:
        return this.runGames();

      case STEAM_SYNCS.ACHIEVEMENTS:
        return this.runAchievements();

      default:
        await this.runGames();
        await this.runAchievements();
    }
  }

  /**
   * Syncrhonizes all data from the configured Steam user.
   *
   * Throws if the synchronization fails.
   */
  private async runGames() {
    const syncId = await this.repositories.syncs.start("steam");

    this.progress.start("Fetching \"games\"...");

    try {
      const games = await this.client.fetchOwnedGames();

      let processed = 0;

      for (const game of games) {
        const normalized = this.normalizer.normalizeGame(game);

        this.progress.update(`Fetching ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);
        await this.repositories.time?.recordTotalTime({ entityId, totalSeconds: normalized.timeSeconds });

        processed++;
      }

      this.progress.success(`Processed ${processed} "games"`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "games": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Syncrhonizes all achievements from the configured Steam user.
   *
   * Throws if the synchronization fails.
   */
  private async runAchievements() {
    const syncId = await this.repositories.syncs.start("steam_achievements");

    this.progress.start("Fetching \"achievements\"...");

    try {
      const games = await this.client.fetchOwnedGames();

      let processed = 0;

      for (const game of games) {
        if (!game.has_community_visible_stats)
          continue;

        const achievements = await this.client.fetchUserAchievementsWithMetadata(game.appid);

        for (const achievement of achievements) {
          const normalized = this.normalizer.normalizeAchievement(achievement);

          this.progress.update(`Processing ${normalized.title}${game.name ? ` for game ${game.name}` : ""}`);

          const { entityId } = await this.repositories.entities.getOrCreateFromSource({
            kind: "achievement",
            title: normalized.title,
            source: "steam",
            externalId: `${game.appid}-${normalized.externalId}`,
          });

          await this.repositories.metadata.upsert(entityId, normalized.metadata);

          const res = await this.repositories.entities.getFromSource({
            source: "steam",
            externalId: String(game.appid),
          });

          if (res?.entityId) {
            await this.repositories.relationships.createRelationship({
              parentId: res.entityId,
              parentKind: "game",
              childId: entityId,
              childKind: "achievement",
              type: "HAS_ACHIEVEMENT",
            });
          }

          processed++;
        }
      }

      this.progress.success(`Processed ${processed} "achievements"`);

      await this.repositories.syncs.success(syncId, {
        achievements_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "achievements": ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
