import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkAdminAccess } from "./adminSlice";

/**
 * Cho biết người dùng hiện tại có phải admin không.
 * Gọi ở bất kỳ đâu (menu, layout); chỉ hỏi server một lần mỗi phiên đăng nhập.
 */
export function useAdminAccess() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((s) => s.auth.status);
  const access = useAppSelector((s) => s.admin.access);

  useEffect(() => {
    if (authStatus === "authenticated" && access === "unknown") {
      void dispatch(checkAdminAccess());
    }
  }, [authStatus, access, dispatch]);

  return useMemo(
    () => ({
      isAdmin: access === "admin",
      /** Đã có kết quả (admin hoặc không), dùng để chờ trước khi chuyển hướng. */
      checked: access === "admin" || access === "user",
    }),
    [access],
  );
}
