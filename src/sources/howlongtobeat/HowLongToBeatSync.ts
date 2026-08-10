import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { HowLongToBeatClient } from "./HowLongToBeatClient";
import type { HowLongToBeatNormalizer } from "./HowLongToBeatNormalizer";

import { HOW_LONG_TO_BEAT_SYNCS } from "./HowLongToBeatSource";

/**
 * Synchronizes How Long To Beat games into the application's canonical data model.
 *
 * Retrieves games from How Long To Beat, normalizes them, persists entities and metadata, and records the outcome of the synchronization
 */
export class HowLongToBeatSync {
  constructor(
    private client: HowLongToBeatClient,
    private normalizer: HowLongToBeatNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) {}

  /**
   * Synchronizes all data from the configured How Long To Beat user.
   */
  async run() {
    switch (this.request?.syncId) {
      case HOW_LONG_TO_BEAT_SYNCS.PLAYING:
        return this.runPlayingGames();

      case HOW_LONG_TO_BEAT_SYNCS.BACKLOG:
        return this.runBacklogGames();

      case HOW_LONG_TO_BEAT_SYNCS.FAVOURITE:
        return this.runFavouriteGames();

      case HOW_LONG_TO_BEAT_SYNCS.COMPLETED:
        return this.runCompletedGames();

      case HOW_LONG_TO_BEAT_SYNCS.RETIRED:
        return this.runRetiredGames();

      default:
        await this.runPlayingGames();
        await this.runBacklogGames();
        await this.runFavouriteGames();
        await this.runCompletedGames();
        await this.runRetiredGames();
    }
  }

  /**
   * Synchronizes playing games from the configured How Long To Beat user.
   *
   * Throws if the synchronization fails.
   */
  private async runPlayingGames() {
    const syncId = await this.repositories.syncs.start("howlongtobeat_playing");

    this.progress.start("Fetching \"playing\" games...");

    try {
      const games = await this.client.fetchPlayingGames();

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

      this.progress.success(`Processed ${processed} "playing" games`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "playing" games: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes backlog games from the configured How Long To Beat user.
   *
   * Throws if the synchronization fails.
   */
  private async runBacklogGames() {
    const syncId = await this.repositories.syncs.start("howlongtobeat_backlog");

    this.progress.start("Fetching \"backlog\" games");

    try {
      const games = await this.client.fetchBacklogGames();

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

      this.progress.success(`Processed ${processed} "backlog" games`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "backlog" games: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes favourite games from the configured How Long To Beat user.
   *
   * Throws if the synchronization fails.
   */
  private async runFavouriteGames() {
    const syncId = await this.repositories.syncs.start("howlongtobeat_favourite");

    this.progress.start("Fetching \"favourite\" games...");

    try {
      const games = await this.client.fetchFavouriteGames();

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

      this.progress.success(`Processed ${processed} "favourite" games`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "favourite" games: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes completed games from the configured How Long To Beat user.
   *
   * Throws if the synchronization fails.
   */
  private async runCompletedGames() {
    const syncId = await this.repositories.syncs.start("howlongtobeat_completed");

    this.progress.start("Fetching \"completed\" games...");

    try {
      const games = await this.client.fetchCompletedGames();

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

      this.progress.success(`Processed ${processed} "completed" games`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "completed" games: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes retired games from the configured How Long To Beat user.
   *
   * Throws if the synchronization fails.
   */
  private async runRetiredGames() {
    const syncId = await this.repositories.syncs.start("howlongtobeat_retired");

    this.progress.start("Fetching \"retired\" games...");

    try {
      const games = await this.client.fetchRetiredGames();

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

      this.progress.success(`Processed ${processed} "retired" games`);

      await this.repositories.syncs.success(syncId, {
        games_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "retired" games: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
