import type { ConfigurationFile } from "@/config/ConfigurationFile";

import { logger } from "@/utils/logger";
import { prompt } from "@/utils/prompt";

import type { Command } from "./Command";

import { ArgumentParser } from "./ArgumentParser";

export class InitCommand implements Command {
  constructor(private readonly configFile: ConfigurationFile) { }

  async run(args: string[]) {
    const request = ArgumentParser.parse(args);

    logger.log("Welcome to Tracker!");
    logger.blank();

    const path = this.configFile.path;

    if (this.configFile.exists()) {
      logger.log("Configuration already exists.");
      logger.log(path);
      return;
    }

    const url
      = typeof request.url === "string"
        ? request.url
        : await prompt.input("Supabase URL:");

    const serviceKey
      = typeof request.serviceKey === "string"
        ? request.serviceKey
        : await prompt.password("Service role key:");

    this.configFile.save({ database: { url, serviceKey }, sources: {} });

    logger.success("Configuration created");
    logger.log(path);
  }
}
