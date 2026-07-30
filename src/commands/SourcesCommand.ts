import type { SourceRegistry } from "@/sources/utils/SourceRegistry";

import { logger } from "@/utils/logger";

import type { Command } from "./Command";

export class SourcesCommand implements Command {
  constructor(private sourceRegistry: SourceRegistry) { }

  async run() {
    for (const source of this.sourceRegistry.all()) {
      if (!source.hasConfiguration()) {
        logger.error(source.displayName);
        continue;
      }

      logger.success(source.displayName);
    }
  }
}
