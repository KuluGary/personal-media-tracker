import envPaths from "env-paths";
import { join } from "node:path";

const paths = envPaths("tracker");

export function getConfigurationPath() {
  return join(paths.config, "config.toml");
}
