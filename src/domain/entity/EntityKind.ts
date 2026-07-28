export type EntityKind
  = VideoEntityKind
  | GameEntityKind
  | MusicEntityKind
  | MediaEntityKind
  | BookEntityKind
  | BlogEntityKind;

export type VideoEntityKind = "video" | "playlist" | "subscription";

export type GameEntityKind = "game" | "achievement";

export type MusicEntityKind = "album" | "song";

export type MediaEntityKind = "movie" | "show" | "season" | "episode";

export type BookEntityKind = "book" | "comic" | "manga" | "chapter";

export type BlogEntityKind = "blog" | "post";
