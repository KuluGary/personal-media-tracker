export interface SourceDefinition {
  id: string;
  displayName: string;

  hasConfiguration: () => boolean;
  getValidatedConfiguration: () => object;
  createSync: () => Promise<{
    run: () => Promise<void>;
  }>;
}
