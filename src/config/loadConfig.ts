import type { AppConfig } from "./AppConfig";

import { loadConfigFromFile } from "./loadConfigFromFile";

export async function loadConfig(): Promise<AppConfig> {
  return loadConfigFromFile();
}
