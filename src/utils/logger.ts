/* eslint-disable no-console */
import picocolors from "picocolors";

export const logger = {
  info: (arg: string, options?: Options) => console.log(picocolors.blue(indent(`ℹ ${arg}`, options?.indent))),
  error: (arg: string, options?: Options) => console.log(picocolors.red(indent(`✗ ${arg}`, options?.indent))),
  success: (arg: string, options?: Options) => console.log(picocolors.green(indent(`✓ ${arg}`, options?.indent))),
  warn: (arg: string, options?: Options) => console.log(picocolors.yellow(indent(`⚠ ${arg}`, options?.indent))),
  log: (arg: string, options?: Options) => console.log(indent(arg, options?.indent)),
  blank: () => console.log(),
};

function indent(str: string, amount = 0) {
  return `${"  ".repeat(amount)}${str}`;
}

interface Options {
  indent: number;
}
