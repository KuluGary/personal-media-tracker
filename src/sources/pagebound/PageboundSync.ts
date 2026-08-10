import type { Repositories } from "@/repositories/Repositories";
import type { SyncProgressReporter } from "@/sync/SyncProgressReport";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { PageboundClient } from "./PageboundClient";
import type { PageboundNormalizer } from "./PageboundNormalizer";

import { PAGEBOUND_SYNCS } from "./PageboundSource";

/**
 * Synchronizes Pagebound books into the application's canonical data model.
 *
 * Retrieves books from Pagebound, normalizes them, persists entites and metadata,
 * and records the outcome of the synchronization.
 */
export class PageboundSync {
  constructor(
    private client: PageboundClient,
    private normalizer: PageboundNormalizer,
    private repositories: Repositories,
    private progress: SyncProgressReporter,
    private request?: SyncRequest,
  ) { }

  /**
   * Synchronizes all data from the configured Pagebound user.
   *
   * Throws if the synchronization fails.
   */
  async run() {
    switch (this.request?.syncId) {
      case PAGEBOUND_SYNCS.FINISHED:
        return this.runFinishedBooks();

      case PAGEBOUND_SYNCS.CURRENT:
        return this.runCurrentBooks();

      case PAGEBOUND_SYNCS.TBR:
        return this.runToBeReadBooks();

      default:
        await this.runFinishedBooks();
        await this.runCurrentBooks();
        await this.runToBeReadBooks();
    }
  }

  /**
   * Synchronizes finished books from the configured Pagebound user.
   *
   * Throws if the synchronization fails.
   */
  async runFinishedBooks() {
    const syncId = await this.repositories.syncs.start("pagebound_finished");

    this.progress.start("Fetchhing \"finished\" books...");

    try {
      const books = await this.client.fetchFinishedBooks();

      let processed = 0;

      for (const book of books) {
        const normalized = this.normalizer.normalizeBooks(book);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);
        await this.repositories.trackable?.upsert({
          entityId,
          status: "completed",
          progress: book.progress,
        });

        processed++;
      }

      this.progress.success(`Processed ${processed} "finished" books`);

      await this.repositories.syncs.success(syncId, {
        books_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "finished" books: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes current books from the configured Pagebound user.
   *
   * Throws if the synchronization fails.
   */
  async runCurrentBooks() {
    const syncId = await this.repositories.syncs.start("pagebound_current");

    this.progress.start("Fetchhing \"current\" books...");

    try {
      const books = await this.client.fetchCurrentBooks();

      let processed = 0;

      for (const book of books) {
        const normalized = this.normalizer.normalizeBooks(book);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);
        await this.repositories.trackable?.upsert({
          entityId,
          status: "in_progress",
          progress: book.progress,
          startedAt: book.current_reading_instance?.started_reading_at_date,
          finishedAt: book.current_reading_instance?.finished_reading_at_date ?? undefined,
        });

        processed++;
      }

      this.progress.success(`Processed ${processed} "current" books`);

      await this.repositories.syncs.success(syncId, {
        books_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "current" books: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }

  /**
   * Synchronizes to be read books from the configured Pagebound user.
   *
   * Throws if the synchronization fails.
   */
  async runToBeReadBooks() {
    const syncId = await this.repositories.syncs.start("pagebound_tbr");

    this.progress.start("Fetchhing \"to be read\" books...");

    try {
      const books = await this.client.fetchToBeReadBooks();

      let processed = 0;

      for (const book of books) {
        const normalized = this.normalizer.normalizeBooks(book);

        this.progress.update(`Processing ${normalized.title}`);

        const { entityId } = await this.repositories.entities.getOrCreateFromSource({
          kind: normalized.kind,
          title: normalized.title,
          source: normalized.source,
          externalId: normalized.externalId,
        });

        await this.repositories.metadata.upsert(entityId, normalized.metadata);
        await this.repositories.trackable?.upsert({
          entityId,
          status: "backlog",
          progress: book.progress,
        });

        processed++;
      }

      this.progress.success(`Processed ${processed} "to be read" books`);

      await this.repositories.syncs.success(syncId, {
        books_processed: processed,
      });
    }
    catch (e) {
      this.progress.fail(`Sync failed for "to be read" books: ${(e as Error).message}`);

      await this.repositories.syncs.fail(syncId, e as Error);
      throw e;
    }
  }
}
