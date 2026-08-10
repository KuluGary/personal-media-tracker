export interface SourceConfigurationField {
  key: string;
  type: "text" | "password" | "boolean" | "text-array";
  label?: string;
  help?: string;
  description?: string;
}
