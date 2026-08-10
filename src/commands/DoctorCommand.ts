import type { DatabaseDoctor } from "@/db/DatabaseDoctor";
import type { SourceRegistry } from "@/sources/SourceRegistry";

import { logger } from "@/utils/logger";

import type { Command } from "./Command";

export class DoctorCommand implements Command {
  constructor(private readonly sourceRegistry: SourceRegistry, private readonly databaseDoctor: DatabaseDoctor) { }

  async run() {
    logger.log("Tracker Doctor\n");

    await this.checkConfiguration();
    await this.checkDatabase();
    await this.checkSources();
  }

  private async checkConfiguration() {
    logger.log("Configuration");
    logger.success("Configuration file found", { indent: 1 });
    logger.blank();
  }

  private async checkDatabase() {
    logger.log("Database");

    try {
      await this.databaseDoctor.check();

      logger.success("Connected", { indent: 1 });
      logger.blank();
    }
    catch (error) {
      logger.error("Unable to connect", { indent: 1 });
      logger.error(`${(error as Error).message}`, { indent: 2 });
      logger.blank();
    }
  }

  private async checkSources() {
    logger.log("Sources");

    for (const source of this.sourceRegistry.all()) {
      if (!source.hasConfiguration()) {
        logger.log(`○ ${source.displayName} (not configured)`, { indent: 1 });
        continue;
      }

      try {
        const config = source.getValidatedConfiguration();

        await source.validateConfiguration(config);

        logger.success(source.displayName, { indent: 1 });
      }
      catch (error) {
        logger.error(source.displayName, { indent: 1 });
        logger.error((error as Error).message, { indent: 2 });
      }
    }

    logger.blank();
  }
}
