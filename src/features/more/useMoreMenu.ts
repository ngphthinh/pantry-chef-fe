import { useCallback, useEffect, useMemo } from "react";

import { jsonCache } from "@/core/cache/jsonCache";
import { runAction, type ActionResult } from "@/core/result/runAction";
import { useAuth } from "@/features/auth/useAuth";
import { useUser } from "@/features/auth/useUser";

export function useMoreMenu() {
    // Destructure: object useUser() trả về là object mới ở mỗi lần render.
    const { user: profileUser, refresh, deleteAccount } = useUser();
    const { user: authUser, signOut } = useAuth();
    const user = profileUser ?? authUser;

    // Mở thẳng tab này mà chưa có hồ sơ thì tải. Lỗi bỏ qua: thẻ hồ sơ hiện placeholder.
    useEffect(() => {
        if (!user) void runAction(() => refresh(), "Không tải được hồ sơ.");
    }, [user, refresh]);

    const profile = useMemo(() => {
        if (!user) return null;
        const name = user.displayName?.trim() || user.email;
        return {
            name,
            email: user.email,
            avatarUri: user.avatarUri ?? undefined,
            initial: name.charAt(0).toUpperCase(),
        };
    }, [user]);

    const handleSignOut = useCallback(async (): Promise<ActionResult> => {
        const result = await runAction(() => signOut(), "Không đăng xuất được.");
        // Token ở máy bị xoá dù API lỗi hay không (theo API doc), nên cache cũng xoá luôn.
        // TẠM THỜI: nên chuyển vào authService rồi xoá dòng này.
        await jsonCache.clearAll();
        return result;
    }, [signOut]);

    const handleDeleteAccount = useCallback(async (): Promise<ActionResult> => {
        const result = await runAction(() => deleteAccount(), "Không xoá được tài khoản.");
        if (result.ok) await jsonCache.clearAll();
        return result;
    }, [deleteAccount]);

    return { profile, signOut: handleSignOut, deleteAccount: handleDeleteAccount };
}