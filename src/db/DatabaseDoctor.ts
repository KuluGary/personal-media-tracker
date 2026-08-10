import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TrackerDatabase } from "./types";

export class DatabaseDoctor {
  constructor(private readonly db: TrackerDatabase) { }

  async check() {
    const { error } = await this.db
      .from("entities")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }
  }
}
