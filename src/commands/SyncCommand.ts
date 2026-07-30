import type { SourceRegistry } from "@/sources/utils/SourceRegistry";

import { logger } from "@/utils/logger";

import type { Command } from "./Command";

export class SyncCommand implements Command {
  constructor(private readonly sourceRegistry: SourceRegistry) { }

  async run(args: string[]) {
    const sourceId = args[0];

    if (sourceId) {
      await this.syncSource(sourceId);
      return;
    }

    await this.syncAll();
  }

  private async syncSource(sourceId: string) {
    const source = this.sourceRegistry.get(sourceId);

    if (!source)
      throw new Error(`Unknown source: ${sourceId}`);

    logger.log(`Syncing ${source.displayName}...`);

    const startedAt = Date.now();

    const sync = await source.createSync();
    await sync.run();

    const elapsed = Date.now() - startedAt;

    logger.success(`${source.displayName} (${this.formatDuration(elapsed)})`);
    logger.blank();
  }

  private async syncAll() {
    const sources = this.sourceRegistry.configured();

    let succeeded = 0;
    let failed = 0;

    const startedAt = Date.now();

    for (const source of sources) {
      try {
        await this.syncSource(source.id);
        succeeded++;
      }
      catch (error) {
        failed++;

        logger.error(source.displayName);
        logger.error((error as Error).message);
        logger.blank();
      }
    }

    const elapsed = Date.now() - startedAt;

    logger.log(`Finished syncing ${sources.length} sources in ${this.formatDuration(elapsed)}.`);
    logger.success(`${succeeded} succeeded`, { indent: 1 });
    logger.error(` ${failed} failed`, { indent: 1 });
  }

  private formatDuration(ms: number) {
    return ms < 1000
      ? `${ms} ms`
      : `${(ms / 1000).toFixed(1)} s`;
  }
}
