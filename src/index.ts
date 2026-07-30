import { DoctorCommand } from "./commands/DoctorCommand";
import { InitCommand } from "./commands/InitCommand";
import { SourcesCommand } from "./commands/SourcesCommand";
import { SyncCommand } from "./commands/SyncCommand";
import { loadConfig } from "./config/loadConfig";
import { DatabaseDoctor } from "./db/DatabaseDoctor";
import { db } from "./db/supabase";
import { createSourceRegistry } from "./sources/utils/SourceRegistry";

async function main() {
  const command = process.argv[2];

  if (!command)
    throw new Error("Please add a command");

  const commands = {
    init: () => new InitCommand(),
    doctor: async () => {
      const config = await loadConfig();

      return new DoctorCommand(createSourceRegistry(config), new DatabaseDoctor(db));
    },
    sources: async () => {
      const config = await loadConfig();

      return new SourcesCommand(createSourceRegistry(config));
    },
    sync: async () => {
      const config = await loadConfig();

      return new SyncCommand(createSourceRegistry(config));
    },
  };

  const factory = commands[command as keyof typeof commands];

  if (!factory) {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }

  const handler = await factory();
  await handler.run(process.argv.slice(3));
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
