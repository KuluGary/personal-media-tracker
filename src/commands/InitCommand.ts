import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { createDefaultConfiguration } from "@/config/createDefaultConfiguration";
import { getConfigurationPath } from "@/config/getConfigPath";
import { logger } from "@/utils/logger";
import { prompt } from "@/utils/prompt";

import type { Command } from "./Command";

export class InitCommand implements Command {
  async run() {
    logger.log("Welcome to Tracker!");
    logger.blank();

    const path = getConfigurationPath();

    if (existsSync(path)) {
      logger.log("Configuration already exists.");
      logger.log(path);
      return;
    }

    const url = await prompt.input("Supabase URL:");
    const serviceKey = await prompt.password("Service role key:");

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, createDefaultConfiguration(url, serviceKey));

    logger.success("Configuration created");
    logger.log(path);
  }
}
