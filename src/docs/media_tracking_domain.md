# Media Tracking Domain Documentation

## 1. Overview

This project uses a generic domain model for tracking personal media in a single database, regardless of the source system that provided the data. The current implementation is already broader than a game-only tracker: it supports games, videos, shows, music, books/comics, and blog-style posts, with external integrations acting as adapters rather than defining the domain model.

The domain is organized around a few core ideas:

1. **One canonical entity per thing** – every tracked item has an internal entity record.
2. **External sources are adapters** – sync clients and normalizers produce entities, metadata, and relationships without dictating the schema.
3. **Hierarchies are expressed as relationships** – parent/child links are flexible and reusable.
4. **Behavior lives in capabilities** – progress, time tracking, and achievement state are modeled separately from identity.
5. **Metadata is descriptive, not behavioral** – source-derived attributes are stored as JSON, while progress/time stays in dedicated state tables.
6. **Invariants protect correctness** – the domain enforces valid kinds, relationship shapes, and state transitions.

The current codebase already reflects this model in the domain layer and in the Supabase-backed repositories.

---

## 2. Core tables

### 2.1 `entities`

- **Purpose:** The canonical record for every media item.
- **Columns:**
  - `id` (PK)
  - `kind` (text)
  - `title` (text)
  - `created_at`, `updated_at` (timestamps)

- **Notes:**
  - `kind` is semantic, not structural. It describes what the entity is, not how it must be stored.
  - The current implementation defines kinds such as `game`, `achievement`, `video`, `playlist`, `subscription`, `movie`, `show`, `season`, `episode`, `album`, `song`, `book`, `comic`, `manga`, `chapter`, `blog`, and `post`.

### 2.2 `source_identities`

- **Purpose:** Maps an external system identifier to an internal entity.
- **Columns:**
  - `id` (PK)
  - `entity_id` (FK → `entities`)
  - `source` (text, e.g. `steam`, `youtube`, `trakt`, `retroachievements`)
  - `external_id` (text)
  - `created_at`

- **Invariants:**
  - `(source, external_id)` is unique.
  - One entity can have multiple source identities.
  - Deleting an entity cascades its source identity rows.

### 2.3 `relationships`

- **Purpose:** Represents parent/child links between entities.
- **Columns:**
  - `id` (PK)
  - `parent_entity_id` (FK → `entities`)
  - `child_entity_id` (FK → `entities`)
  - `relationship_type` (text)
  - `created_at`

- **Invariants:**
  - No self-links (`parent_entity_id != child_entity_id`).
  - No duplicate edges (`parent_entity_id`, `child_entity_id`, `relationship_type`).
  - The domain layer enforces that only valid kind combinations participate in a relationship type.

- **Implemented relationship types in the current domain code:**
  - `HAS_SEASON` → `show` → `season`
  - `HAS_EPISODE` → `season` → `episode`
  - `HAS_ACHIEVEMENT` → `game` → `achievement`
  - `HAS_TRACK` → `album` → `song`
  - `HAS_SUBSCRIPTION` → `subscription` → `video` or `playlist`
  - `HAS_PLAYLIST` → `playlist` → `video`

- **Additional relationship types in the type union:**
  - `HAS_VIDEO` and `HAS_POST` are defined in the domain type system for broader extensibility, but the currently enforced invariant module focuses on the relationship patterns above.

### 2.4 `entity_metadata`

- **Purpose:** Stores descriptive, source-derived data for an entity.
- **Columns:**
  - `entity_id` (PK, FK → `entities`)
  - `data` (`jsonb`)
  - `updated_at`

- **Notes:**
  - This is intentionally flexible and kind-specific.
  - Examples include genres, runtime, platforms, streaming metadata, release dates, and channel information.
  - Behavioral state such as progress, completion, and time should never be stored here.

### 2.5 `trackable_state`

- **Purpose:** Stores user-facing progress/status for trackable entities.
- **Columns:**
  - `entity_id` (PK, FK → `entities`)
  - `status` (text, e.g. `backlog`, `in_progress`, `completed`)
  - `progress` (numeric, optional)
  - `started_at`, `finished_at` (timestamps, optional)
  - `updated_at`

- **Invariants:**
  - One row per entity.
  - `finished_at` must not be earlier than `started_at`.
  - This capability is intended for entities that are inherently progress-oriented.

### 2.6 `time_state`

- **Purpose:** Stores accumulated time spent on an entity.
- **Columns:**
  - `entity_id` (PK, FK → `entities`)
  - `total_seconds` (numeric, non-negative)
  - `updated_at`

- **Invariants:**
  - One row per entity.
  - `total_seconds` must be non-negative.
  - This is intended for entities that can meaningfully accumulate play/watch/listen time.

### 2.7 `source_syncs`

- **Purpose:** Tracks the execution of each sync run for an external source.
- **Columns:**
  - `id` (PK)
  - `source` (text)
  - `status` (text)
  - `started_at`, `finished_at`
  - `stats` (`jsonb`, optional)
  - `error_message` (text, optional)

- **Notes:**
  - This is an operational table used by the sync pipeline rather than a business-domain table.
  - It helps the app understand whether a source import succeeded and what it processed.

### 2.8 `source_identity_sync_state`

- **Purpose:** Stores per-source-identity sync metadata such as the last sync status and errors.
- **Columns:**
  - `source_identity_id` (FK → `source_identities`)
  - `last_sync_status`
  - `last_synced_at`
  - `last_error`

- **Notes:**
  - This complements `source_syncs` by attaching sync state to a specific external identity rather than to the entire source run.

---

## 3. Capabilities

Capabilities are composable behaviors attached to entities. They are separate from the base entity record so the same entity shape can support different behaviors depending on kind.

| Capability | Applies to | What it stores |
| --- | --- | --- |
| Trackable | `game`, `episode`, `movie`, `song` | status, progress, started/finished timestamps |
| Time-based | `game`, `episode`, `movie`, `song` | accumulated time in seconds |
| Achievements | `game` children of kind `achievement` | achievement unlock state |
| Aggregation | container-style entities such as `show`, `season`, `album`, `playlist`, `subscription` | derived from child entities, computed on demand |

Containers such as shows, seasons, albums, and playlists do not need to own their own progress/time rows unless the product later decides to make them first-class trackable entities.

---

## 4. Current invariants in the code

The implementation currently enforces the following rules:

- Every entity has a unique internal identity and a kind.
- External `(source, external_id)` pairs map to a single internal entity.
- Relationships cannot be self-referential.
- Relationships cannot be duplicated.
- The relationship invariants currently validate the following parent/child combinations:
  - `show` → `season`
  - `season` → `episode`
  - `game` → `achievement`
  - `album` → `song`
  - `subscription` → `video` or `playlist`
  - `playlist` → `video`
- Trackable and time-based state only exist for kinds that the capability layer marks as applicable.
- `finished_at` must not precede `started_at`.
- `total_seconds` must be non-negative.

The domain rules live in the invariants modules under the domain layer, while the repository layer persists the data in Supabase.

---

## 5. Domain principles

1. **Sources are adapters:** sync clients and normalizers emit entities, relationships, and metadata, but they do not define the domain structure.
2. **Relationships represent hierarchy:** parent/child links are the primary way of expressing composition.
3. **Metadata is descriptive:** JSON blobs are used for descriptive attributes and source-specific enrichment.
4. **Capabilities model behavior:** progress, time, and achievement behavior are separate from the core entity table.
5. **The model is extensible:** the current code already covers games, video/media, music, books/comics, and blog-like content, and can grow further without changing the core shape.
6. **Vertical slices are preferred:** the implementation flows from source → normalizer → sync → repositories → domain state.

---

## 6. Current implementation context

The current repository already reflects this domain model in a few concrete ways:

- The entity kinds and relationship types are defined in the domain layer under the entity and relationship modules.
- The capability layer determines which kinds are trackable and time-based.
- The repository layer separates entity identity, metadata, relationships, progress, and time into distinct persistence concerns.
- Sync sources such as Steam, RetroAchievements, YouTube, FreshRSS, MangaDex, and Pagebound all feed into the same model instead of creating source-specific tables.

This makes the model suitable for expanding from the current sync integrations into additional media types without introducing one-off schema patterns.

---

## 7. Future considerations

- Multi-user support: add a user dimension to state tables.
- Raw payload caching: store additional source payloads as JSON if the product needs auditability.
- Analytics: add sessions, streaks, daily summaries, and derived metrics.
- Aggregation caches: compute and cache completion percentages for shows, albums, playlists, and similar containers.
- Access control: use row-level security in Supabase if the app becomes multi-user.
- Additional capability types: the model can evolve if new behaviors (e.g. ratings, collections, or watchlists) need first-class support.

---

## 8. Diagram

![Domain diagram](./diagram.jpg)

The diagram should be read as a layered model:

- `entities` sits at the center as the canonical identity.
- `source_identities` connects internal entities to external IDs.
- `relationships` define composition and hierarchy.
- `entity_metadata` stores descriptive attributes.
- `trackable_state` and `time_state` hold behavioral state.
- `source_syncs` and `source_identity_sync_state` capture operational sync health.
