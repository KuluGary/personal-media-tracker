export interface SyncRequest {
  sourceId?: string;
  syncId?: string;

  from?: Date;
  to?: Date;

  params?: Record<string, string>;
}
