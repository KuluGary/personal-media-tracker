export function defined<T extends object>(value: T): T | undefined {
  return Object.values(value).some(v => v !== undefined)
    ? value
    : undefined;
}
