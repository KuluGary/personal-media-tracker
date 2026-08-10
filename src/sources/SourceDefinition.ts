import type z from "zod";

import type { SyncDefinition } from "@/sync/SyncDefinition";
import type { SyncRequest } from "@/sync/SyncRequest";

import type { SourceConfigurationField } from "./SourceConfigurationField";

export interface SourceDefinition {
  id: string;
  displayName: string;

  hasConfiguration: () => boolean;
  getValidatedConfiguration: () => object;
  createSync: (options?: SyncRequest) => Promise<{
    run: () => Promise<void>;
  }>;
  getConfigurationSchema: () => z.ZodObject<any>;
  normalizeConfiguration: (configuration: Record<string, unknown>) => Promise<Record<string, unknown>>;
  validateConfiguration: (configuration: unknown) => Promise<void>;
  getConfigurationFields: () => SourceConfigurationField[];
  getSyncDefinitions: () => SyncDefinition[];
}
