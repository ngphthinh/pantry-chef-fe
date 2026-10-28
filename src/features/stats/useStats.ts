import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { runAction } from "@/core/result/runAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStats } from "./statsSlice";

export function useStats() {
    const dispatch = useAppDispatch();
    const stats = useAppSelector((s) => s.stats.data);
    const status = useAppSelector((s) => s.stats.status);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await runAction(() => dispatch(fetchStats()), "Không tải được thống kê.");
        setError(result.ok ? null : result.message);
        return result;
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            void load();
        }, [load]),
    );

    return useMemo(
        () => ({
            stats,
            error,
            // Chỉ hiện "đang tải" khi chưa có số liệu; có rồi thì hiện số cũ và cập nhật ngầm.
            isLoading: status === "loading" && stats === null,
            isRefreshing: status === "loading" && stats !== null,
            reload: load,
        }),
        [stats, error, status, load],
    );
}