export interface SyncRequest {
  sourceId?: string;
  syncId?: string;

  from?: Date;
  to?: Date;

  tag?: string;

  params?: Record<string, string>;
}
