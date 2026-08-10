import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { RetroachievementsClient } from "./RetroachievementsClient";
import type { RetroachievementsNormalizer } from "./RetroachievementsNormalizer";

import { RETROACHIEVEMENTS_SYNCS } from "./RetroachievementsSource";

/**
 * Synchronizes Retroachievements data into the application's canonical data model.
 *
 * Retrieves data from Retroachievements, normalizes it, persists entities and metadata
 * and records the outcome of the synchronization
 */
export class RetroachievementsSync {
  constructor(
    private client: RetroachievementsClient,
    private normalizer: RetroachievementsNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  /**
   * Syncrhonizes all data from the configured Retroachievmeents user.
   *
   * Throws if the synchronization fails.
   */
  async run() {
    switch (this.request?.syncId) {
      case RETROACHIEVEMENTS_SYNCS.GAMES:
        return this.runGameProgress();

      case RETROACHIEVEMENTS_SYNCS.ACHIEVEMENTS:
        return this.runAchievements();

      default:
        await this.runGameProgress();
        await this.runAchievements();
    }
  }

  /**
   * Syncrhonizes all games from the configured Retroachievmeents user.
   *
   * Throws if the synchronization fails.
   */
  async runGameProgress() {
    const syncId = await this.repositories.syncs.start("retroachievements_progress");

    this.progress.start("Fetching \"games\"...");

    try {
      const games = await this.client.fetchGameProgress();

      let processed = 0;

      for (const game of games) {
        const normalized = this.normalizer.normalizeGame(game);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);

        processed++;
      }

      this.progress.success(`Processed ${processed} \"games\".`);

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
   * Syncrhonizes all achievements from the configured Retroachievmeents user.
   *
   * Throws if the synchronization fails.
   */
  async runAchievements() {
    const syncId = await this.repositories.syncs.start("retroachievements_achievements");

    this.progress.start("Fetching \"achievements\"");

    try {
      const { startDate, endDate } = await this.resolveSyncRange();

      const achievements = await this.client.fetchAchievementsBetween(startDate.toString(), endDate.toString());

      let processed = 0;

      for (const achievement of achievements) {
        const normalized = this.normalizer.normalizeAchievement(achievement);

        this.progress.update(`Processing ${normalized.title}${normalized.metadata.gameTitle ? ` for game ${normalized.metadata.gameTitle}` : ""}`);

        const { entityId: achievementEntityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(achievementEntityId, normalized.metadata);

        const gameExternalId = normalized.metadata.gameId;

        const { entityId: gameEntityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: "game",
          title: normalized.metadata.gameTitle,
          source: normalized.source,
          externalId: String(gameExternalId),
        });

        await this.repositories.relationships.createRelationship({
          parentId: gameEntityId,
          childId: achievementEntityId,
          type: "HAS_ACHIEVEMENT",
          parentKind: "game",
          childKind: "achievement",
        });

        processed++;
      }

      this.progress.success(`Processed ${processed} "achievements"`);

      await this.repositories.syncs.success(syncId, {
        achievements_processed: processed,
      });
    }
    catch (error) {
      this.progress.fail(`Sync failed for "achievements": ${(error as Error).message}`);

      await this.repositories.syncs.fail(syncId, error as Error);
      throw error;
    }
  }

  /**
   * Resolves the range of dates submitted by the user.
   * Fallbacks into a 2 month range.
   */
  private async resolveSyncRange() {
    let startDate: number;

    if (this.request?.from) {
      startDate = Math.floor(this.request.from.getTime() / 1000);
    }
    else {
      const startDateStr = await this.repositories.entities.getLatestCreatedAt("achievement");

      if (startDateStr) {
        startDate = Math.floor(new Date(startDateStr).getTime() / 1000);
      }
      else {
        const now = new Date();
        now.setMonth(now.getMonth() - 2);

        startDate = Math.floor(now.getTime() / 1000);
      }
    }

    const endDate = this.request?.to
      ? Math.floor(this.request.to.getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    return {
      startDate,
      endDate,
    };
  }
}
