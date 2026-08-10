export class SourceNotConfigured extends Error {
  message: string;

  constructor(source: string) {
    super();
    this.message = `${source} not configured`;
  }
}
