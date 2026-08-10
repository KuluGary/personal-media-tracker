/**
 * Parses command line flags into a key/value object.
 *
 * Example:
 * --api-key abc --steam-id 123
 *
 * becomes:
 * {
 *   apiKey: "abc",
 *   steamId: "123",
 * }
 */
export class ArgumentParser {
  static parse(args: string[]): Record<string, string> {
    const values: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (!arg?.startsWith("--")) {
        continue;
      }

      const key = this.toCamelCase(arg.slice(2));
      const value = args[i + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for '${arg}'.`);
      }

      values[key] = value;
      i++;
    }

    return values;
  }

  private static toCamelCase(value: string) {
    return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  }
}
