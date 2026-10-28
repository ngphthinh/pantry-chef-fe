import type { UserStatsResponse } from "@/types";

export interface IStatsApi {
    getMe(): Promise<UserStatsResponse>;
}