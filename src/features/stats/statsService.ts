import type { UserStatsResponse } from "@/types";
import type { IStatsApi } from "./types";

export class StatsService {
    constructor(private readonly stats: IStatsApi) {}

    getMe = (): Promise<UserStatsResponse> => this.stats.getMe();
}