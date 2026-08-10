export interface HowLongToBeatListResponse {
  data: HowLongToBeatData;
}

interface HowLongToBeatData {
  count: number;
  gamesList: HowLongToBeatRawGame[];
  total: number;
  cookies: unknown;
  platformList: HowLongToBeatPlatformList[];
  summaryData: HowLongToBeatSummaryData;
}

export interface HowLongToBeatPlatformList {
  platform: string;
  count_total: number;
}

export interface HowLongToBeatSummaryData {
  playCount: number;
  dlcCount: number;
  reviewTotal: number;
  reviewCount: number;
  totalPlayedSp: number;
  totalPlayedMp: number;
  toBeatListed: number;
  uniqueGameCount: number;
}

export interface HowLongToBeatRawGame {
  id: number;
  custom_title: string;
  platform: string;
  play_storefront: string;
  list_playing: number;
  list_backlog: number;
  list_replay: number;
  list_custom: number;
  list_custom2: number;
  list_custom3: number;
  list_comp: number;
  list_retired: number;
  comp_main: number;
  comp_plus: number;
  comp_100: number;
  comp_speed: number;
  comp_speed100: number;
  comp_main_notes: any;
  comp_plus_notes: any;
  comp_100_notes: any;
  comp_speed_notes: any;
  comp_speed100_notes: any;
  invested_pro: number;
  invested_sp: number;
  invested_spd: number;
  invested_co: number;
  invested_mp: number;
  play_count: number;
  play_dlc: number;
  review_score: number;
  review_notes: any;
  retired_notes: any;
  date_start: string;
  date_complete: string;
  date_updated: string;
  date_added: string;
  play_video: any;
  play_notes: any;
  game_id: number;
  game_image: string;
  game_type: string;
  release_world: string;
  comp_all: number;
  comp_all_g: number;
  review_score_g: number;
}

export interface HowLongToBeatNormalizedGame {
  kind: "game";
  title: string;

  source: "howlongtobeat";
  externalId: string;

  metadata: {
    platforms: string[];
  } & Record<string, any>;
}
