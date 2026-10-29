import type { SyncStatusResponse } from "@/types";

export interface ISyncApi {
  listStatuses(): Promise<SyncStatusResponse[]>;
}
