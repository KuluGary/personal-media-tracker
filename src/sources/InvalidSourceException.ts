import type { ZodError } from "zod";

export class InvalidSourceConfiguration extends Error {
  constructor(
    sourceName: string,
    error: ZodError,
  ) {
    super([
      `${sourceName} is configured incorrectly.`,
      ...error.issues.map((issue) => {
        const path = issue.path.join(".");

        return path
          ? `  • ${path}: ${issue.message}`
          : `  • ${issue.message}`;
      }),
    ].join("\n"));

    this.name = "InvalidSourceConfiguration";
  }
}
