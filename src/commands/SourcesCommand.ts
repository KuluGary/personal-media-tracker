import type { SourceRegistry } from "@/sources/SourceRegistry";

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

      const syncs = source.getSyncDefinitions();
      const maxIdLength = Math.max(...syncs.map(sync => sync.id.length));

      for (const sync of syncs) {
        logger.log(
          `• ${sync.id.padEnd(maxIdLength)}     ${sync.displayName}`,
          { indent: 1 },
        );

        for (const parameter of sync.parameters ?? []) {
          logger.log(
            `--${parameter.id}${parameter.required ? " (required)" : ""}`,
            { indent: 2 },
          );

          if (parameter.description) {
            logger.log(parameter.description, { indent: 3 });
          }
        }
      }

      logger.blank();
    }
  }
}
