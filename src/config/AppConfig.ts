import type z from "zod";

import type { configFileSchema } from "./configFileSchema";

export type AppConfig = z.infer<typeof configFileSchema>;
