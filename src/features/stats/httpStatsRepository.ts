import type { AxiosInstance } from "axios";

import type { UserStatsResponse } from "@/types";
import type { IStatsApi } from "./types";

export class HttpStatsRepository implements IStatsApi {
    constructor(private readonly privateHttp: AxiosInstance) {}

    getMe = async (): Promise<UserStatsResponse> => {
        const { data } = await this.privateHttp.get<UserStatsResponse>("/v1/stats/me");
        return data;
    };
}