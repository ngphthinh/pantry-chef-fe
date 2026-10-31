import type { AxiosInstance } from "axios";

import type { SyncStatusResponse } from "@/types";
import type { ISyncApi } from "./types";

export class HttpSyncRepository implements ISyncApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  listStatuses = async (): Promise<SyncStatusResponse[]> => {
    const { data } = await this.privateHttp.get<SyncStatusResponse[]>("/v1/sync-statuses");
    return data;
  };
}
