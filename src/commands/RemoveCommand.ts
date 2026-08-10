import type { ConfigurationFile } from "@/config/ConfigurationFile";
import type { SourceRegistry } from "@/sources/SourceRegistry";

import { logger } from "@/utils/logger";
import { prompt } from "@/utils/prompt";

import type { Command } from "./Command";

export class RemoveCommand implements Command {
  constructor(private readonly sourceRegistry: SourceRegistry, private readonly configFile: ConfigurationFile) { }

  async run(args: string[]) {
    const sourceId = args[0];

    if (!sourceId) {
      throw new Error("Usage: tracker remove <source>");
    }

    const source = this.sourceRegistry.get(sourceId);

    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    if (!source.hasConfiguration()) {
      logger.log(`${source.displayName} is not configured.`);
      return;
    }

    const confirm = await prompt.confirm(`Are you sure you want to remove ${source.displayName}?`);

    if (!confirm)
      return;

    const config = this.configFile.load();

    this.configFile.removeSource(config, source.id);

    this.configFile.save(config);

    logger.success(`${source.displayName} removed.`);
  }
}
