import { existsSync, readFileSync } from "node:fs";
import { parse } from "smol-toml";

import type { AppConfig } from "./AppConfig";

import { configFileSchema } from "./configFileSchema";
import { getConfigurationPath } from "./getConfigPath";

export function loadConfigFromFile(): AppConfig {
  const path = getConfigurationPath();

  if (!existsSync(path)) {
    throw new Error(`Configuration file not found: ${path}`);
  }

  const text = readFileSync(path, "utf8");

  const raw = configFileSchema.parse(parse(text));

  return raw;
}
