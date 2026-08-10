import type { ConfigurationFile } from "@/config/ConfigurationFile";
import type { SourceRegistry } from "@/sources/SourceRegistry";

import { logger } from "@/utils/logger";
import { prompt } from "@/utils/prompt";

import type { Command } from "./Command";

export class EditCommand implements Command {
  constructor(
    private readonly sourceRegistry: SourceRegistry,
    private readonly configFile: ConfigurationFile,
  ) { }

  async run(args: string[]) {
    const sourceId = args[0];

    if (!sourceId) {
      throw new Error("Usage: tracker edit <source>");
    }

    const source = this.sourceRegistry.get(sourceId);

    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    const config = this.configFile.load();

    const current = config.sources[source.id as keyof typeof config.sources];

    if (!current) {
      throw new Error(`${source.displayName} is not configured. Run "tracker add ${source.id}" first.`);
    }

    logger.log(`Editing ${source.displayName} configuration`);

    const schema = source.getConfigurationSchema();

    const configuration: Record<string, unknown> = { ...current };

    for (const key of Object.keys(schema.shape)) {
      configuration[key] = await prompt.input(
        key,
        String(configuration[key] ?? ""),
      );
    }

    const normalized = await source.normalizeConfiguration(configuration);

    const validated = schema.parse(normalized);

    await source.validateConfiguration(validated);

    this.configFile.updateSource(
      config,
      source.id,
      validated,
    );

    this.configFile.save(config);

    logger.success(`${source.displayName} updated.`);
  }
}
