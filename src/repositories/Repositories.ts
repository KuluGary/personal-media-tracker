import type { EntityRepository } from "./EntityRepository";
import type { MetadataRepository } from "./MetadataRepository";
import type { RelationshipRepository } from "./RelationshipRepository";
import type { SourceSyncRepository } from "./SourceSyncRepository";
import type { TimeRepository } from "./TimeRepository";
import type { TrackableRepository } from "./TrackableRepository";

export class Repositories {
  constructor(
    readonly entities: EntityRepository,
    readonly metadata: MetadataRepository,
    readonly relationships: RelationshipRepository,
    readonly syncs: SourceSyncRepository,
    readonly time?: TimeRepository,
    readonly trackable?: TrackableRepository,
  ) {}
}
