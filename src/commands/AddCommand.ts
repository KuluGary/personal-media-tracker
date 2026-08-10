import type { ConfigurationFile } from "@/config/ConfigurationFile";
import type { SourceConfigurationValues } from "@/sources/SourceConfigurationValues";
import type { SourceDefinition } from "@/sources/SourceDefinition";
import type { SourceRegistry } from "@/sources/SourceRegistry";

import { logger } from "@/utils/logger";
import { prompt } from "@/utils/prompt";

import type { Command } from "./Command";

import { ArgumentParser } from "./ArgumentParser";

export class AddCommand implements Command {
  constructor(private readonly sourceRegistry: SourceRegistry, private readonly configFile: ConfigurationFile) { }

  async run(args: string[]) {
    const [sourceId, ...rest] = args;

    if (!sourceId) {
      throw new Error("Usage: tracker add <source>");
    }

    const request: AddRequest = {
      sourceId,
      values: ArgumentParser.parse(rest),
    };

    if (!sourceId) {
      throw new Error("Usage: tracker add <source>");
    }

    const source = this.sourceRegistry.get(sourceId);

    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    logger.log(`Creating ${source.displayName} configuration`);

    const schema = source.getConfigurationSchema();

    const configuration = await this.collectConfiguration(source, request);

    const normalized = await source.normalizeConfiguration(configuration);

    const validated = schema.parse(normalized);

    await source.validateConfiguration(validated);

    const config = this.configFile.load();

    this.configFile.updateSource(config, source.id, validated);

    this.configFile.save(config);

    logger.success(`${source.displayName} configured.`);
  }

  private async collectConfiguration(
    source: SourceDefinition,
    request: AddRequest,
  ) {
    const configuration: SourceConfigurationValues = {};

    for (const field of source.getConfigurationFields()) {
      let value = request.values[field.key];

      if (value === undefined) {
        switch (field.type) {
          case "text":
            value = await prompt.input(field.label ?? field.key);
            break;

          case "password":
            value = await prompt.password(field.label ?? field.key);
            break;

          case "boolean":
            value = await prompt.confirm(field.label ?? field.key);
            break;

          case "text-array":
            value = await prompt.input(field.label ?? field.key);
            break;
        }
      }

      switch (field.type) {
        case "text":
        case "password":
          configuration[field.key] = value;
          break;

        case "boolean":
          configuration[field.key]
            = typeof value === "boolean"
              ? value
              : value === "true";
          break;

        case "text-array":
          configuration[field.key] = Array.isArray(value)
            ? value
            : String(value)
                .split(",")
                .map(v => v.trim())
                .filter(Boolean);
          break;
      }
    }

    return configuration;
  }
}

interface AddRequest {
  sourceId: string;
  values: SourceConfigurationValues;
}
