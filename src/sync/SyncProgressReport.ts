import type { Spinner } from "yocto-spinner";

import { spinner } from "@/utils/spinner";

export interface ProgressReporter {
  start: (text: string) => void;
  update: (text: string) => void;
  success: (text: string) => void;
  fail: (text: string) => void;
}

export class SyncProgressReporter implements ProgressReporter {
  progress: Spinner | null = null;

  start(text: string) {
    this.progress = spinner({ text }).start();
  };

  update(text: string) {
    if (!this.progress)
      throw new Error("SyncProgressReport has not been initialized. Before updating, please run \"start\".");

    this.progress.text = text;
  }

  success(text: string) {
    if (!this.progress)
      throw new Error("SyncProgressReport has not been initialized. Before updating, please run \"start\".");

    this.progress.success(text);
  }

  fail(text: string) {
    if (!this.progress)
      throw new Error("SyncProgressReport has not been initialized. Before updating, please run \"start\".");

    this.progress.error(text);
  }
}
