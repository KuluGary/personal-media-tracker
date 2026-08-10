export interface SyncDefinition {
  id: string;
  displayName: string;
  parameters?: SyncParameterDefinition[];
}

export interface SyncParameterDefinition {
  id: string;
  displayName: string;

  type: "text" | "number" | "boolean";

  description?: string;
  required?: boolean;
}
