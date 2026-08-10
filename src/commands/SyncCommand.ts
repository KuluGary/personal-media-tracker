import type { SourceDefinition } from "@/sources/SourceDefinition";
import type { SourceRegistry } from "@/sources/SourceRegistry";
import type { SyncRequest } from "@/sync/SyncRequest";

import { logger } from "@/utils/logger";

import type { Command } from "./Command";

export class SyncCommand implements Command {
  constructor(private readonly sourceRegistry: SourceRegistry) { }

  async run(args: string[]) {
    const parsedArgs = this.parseArguments(args);

    if (parsedArgs.sourceId) {
      await this.syncSource(parsedArgs);
      return;
    }

    await this.syncAll();
  }

  private async syncSource(args: SyncRequest) {
    if (!args.sourceId)
      throw new Error("No source selected.");

    const source = this.sourceRegistry.get(args.sourceId);

    if (!source) {
      throw new Error(`Unknown source: ${args.sourceId}`);
    }

    this.validateSyncRequest(source, args);

    logger.log(`Syncing ${source.displayName}...`);

    const startedAt = Date.now();

    const sync = await source.createSync(args);
    await sync.run();

    const elapsed = Date.now() - startedAt;

    logger.success(`${source.displayName} (${this.formatDuration(elapsed)})`);
    logger.blank();
  }

  private async syncAll(_options?: SyncRequest) {
    const sources = this.sourceRegistry.configured();

    let succeeded = 0;
    let failed = 0;

    const startedAt = Date.now();

    for (const source of sources) {
      try {
        await this.syncSource({ sourceId: source.id });
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

  private parseArguments(args: string[]): SyncRequest {
    const [sourceId, maybeSyncId, ...rest] = args;

    const request: SyncRequest = {
      sourceId,
    };

    if (maybeSyncId && !maybeSyncId.startsWith("--")) {
      request.syncId = maybeSyncId;
    }
    else if (maybeSyncId) {
      rest.unshift(maybeSyncId);
    }

    for (let i = 0; i < rest.length; i++) {
      const arg = rest[i];

      if (!arg?.startsWith("--"))
        continue;

      const value = rest[i + 1];

      if (!value)
        throw new Error(`Missing value for ${arg}.`);

      switch (arg) {
        case "--from":
          request.from = new Date(value);
          break;

        case "--to":
          request.to = new Date(value);
          break;

        default:
          request.params ??= {};
          request.params[arg.slice(2)] = value;
          break;
      }

      i++;
    }

    return request;
  }

  private validateSyncRequest(source: SourceDefinition, request: SyncRequest) {
    if (!request.syncId) {
      return;
    }

    const sync = source
      .getSyncDefinitions()
      .find(sync => sync.id === request.syncId);

    if (!sync) {
      throw new Error(
        `Unknown sync '${request.syncId}'. Available: ${source.getSyncDefinitions().map(s => s.id).join(", ")}.`,
      );
    }

    for (const parameter of sync.parameters ?? []) {
      if (parameter.required && !request.params?.[parameter.id]) {
        throw new Error(
          `Missing required parameter '--${parameter.id}' for '${sync.id}'.`,
        );
      }
    }
  }
}
