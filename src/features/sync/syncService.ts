import type { SyncStatusResponse } from "@/types";
import type { ISyncApi } from "./types";

export class SyncService {
  constructor(private readonly sync: ISyncApi) {}

  listStatuses = (): Promise<SyncStatusResponse[]> => this.sync.listStatuses();
}
