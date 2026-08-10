import { createClient } from "@supabase/supabase-js";

import type { AppConfig } from "@/config/AppConfig";

import type { Database } from "./types";

export class DatabaseFactory {
  create(config: AppConfig) {
    return createClient<Database>(
      config.database.url,
      config.database.serviceKey,
    );
  }
}
