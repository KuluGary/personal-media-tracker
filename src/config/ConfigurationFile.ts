import envPaths from "env-paths";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse, stringify } from "smol-toml";

import type { AppConfig } from "./AppConfig";

import { configFileSchema } from "./configFileSchema";

export class ConfigurationFile {
  private configPath: string;

  constructor() {
    const paths = envPaths("tracker");

    this.configPath = join(paths.config, "config.toml");
  }

  load(): AppConfig {
    const path = this.configPath;

    if (!existsSync(path)) {
      throw new Error(`Configuration file not found: ${path}`);
    }

    const text = readFileSync(path, "utf-8");

    return configFileSchema.parse(parse(text));
  }

  save(config: AppConfig): void {
    mkdirSync(dirname(this.configPath), { recursive: true });

    writeFileSync(this.configPath, stringify(config));
  }

  exists(): boolean {
    return existsSync(this.configPath);
  }

  get path() {
    return this.configPath;
  }

  updateSource(
    config: AppConfig,
    sourceId: string,
    configuration: unknown,
  ) {
    config.sources[sourceId as keyof AppConfig["sources"]] = configuration as never;
  }

  removeSource(
    config: AppConfig,
    sourceId: string,
  ) {
    delete (config.sources as Record<string, unknown>)[sourceId];
  }
}
