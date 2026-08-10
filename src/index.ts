import { AddCommand } from "./commands/AddCommand";
import { DoctorCommand } from "./commands/DoctorCommand";
import { EditCommand } from "./commands/EditCommand";
import { InitCommand } from "./commands/InitCommand";
import { RemoveCommand } from "./commands/RemoveCommand";
import { SourcesCommand } from "./commands/SourcesCommand";
import { SyncCommand } from "./commands/SyncCommand";
import { ConfigurationFile } from "./config/ConfigurationFile";
import { DatabaseDoctor } from "./db/DatabaseDoctor";
import { DatabaseFactory } from "./db/DatabaseFactory";
import { createSourceRegistry } from "./sources/SourceRegistry";
import { logger } from "./utils/logger";

async function main() {
  const command = process.argv[2];

  if (!command)
    throw new Error("Please add a command");

  const configFile = new ConfigurationFile();

  const commands = {
    init: () => new InitCommand(configFile),
    doctor: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new DoctorCommand(createSourceRegistry(config, db), new DatabaseDoctor(db));
    },
    sources: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new SourcesCommand(createSourceRegistry(config, db));
    },
    sync: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new SyncCommand(createSourceRegistry(config, db));
    },
    add: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new AddCommand(createSourceRegistry(config, db), configFile);
    },
    remove: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new RemoveCommand(createSourceRegistry(config, db), configFile);
    },
    edit: () => {
      const config = configFile.load();
      const db = new DatabaseFactory().create(config);

      return new EditCommand(createSourceRegistry(config, db), configFile);
    },
  };

  const factory = commands[command as keyof typeof commands];

  if (!factory) {
    logger.error(`Unknown command: ${command}`);
    process.exit(1);
  }

  await factory().run(process.argv.slice(3));
}

main().catch((err) => {
  logger.error((err as Error).message);
  process.exit(1);
});
