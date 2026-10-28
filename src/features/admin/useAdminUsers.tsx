import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getErrorMessage } from "./adminFormat";
import { fetchAdminUsers } from "./adminSlice";

const PAGE_SIZE = 20; // API cho phép 10-50
const SEARCH_DELAY_MS = 400;

export interface AdminUserItem {
  key: string;
  name: string;
  email: string;
  initial: string;
  avatarUri?: string;
  /** Số cố định theo từng người, màn hình dùng để chọn màu avatar. */
  avatarSeed: number;
}

/** Hash chuỗi → số nguyên dương, cùng một người luôn ra cùng một màu. */
const hashString = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
};

export function useAdminUsers() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((s) => s.admin.users);

  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const query = useMemo(
    () => ({ keyword: keyword.trim() || undefined, size: PAGE_SIZE }),
    [keyword],
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchAdminUsers(query));
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được danh sách người dùng."));
    } finally {
      setLoaded(true);
    }
  }, [dispatch, query]);

  // Tải lần đầu và tìm kiếm có độ trễ để không gọi API sau mỗi phím gõ
  useEffect(() => {
    const timer = setTimeout(() => void load(), keyword ? SEARCH_DELAY_MS : 0);
    return () => clearTimeout(timer);
  }, [keyword, load]);

  const loadMore = useCallback(async () => {
    try {
      await dispatch(fetchAdminUsers(query, true));
    } catch (e) {
      setError(getErrorMessage(e, "Không tải thêm được."));
    }
  }, [dispatch, query]);

  const items = useMemo<AdminUserItem[]>(
    () =>
      page.items.map((u) => {
        const name = u.displayName?.trim() || "Chưa đặt tên";
        return {
          key: u.id,
          name,
          email: u.email ?? "",
          initial: name.charAt(0).toUpperCase(),
          avatarUri: u.avatarUri || undefined,
          avatarSeed: hashString(u.id),
        };
      }),
    [page.items],
  );

  const isLoading = page.status === "loading";
  const trimmed = keyword.trim();

  return {
    items,
    keyword,
    setKeyword,
    error,
    isLoading,
    isLoadingMore: page.status === "loadingMore",
    /** Đang tải lần đầu, chưa có dòng nào để hiển thị. */
    isInitialLoading: isLoading && items.length === 0,
    /** Đang tải lại (ví dụ vừa đổi từ khoá) nhưng vẫn còn dữ liệu cũ trên màn hình. */
    isRefreshing: isLoading && items.length > 0,
    isEmpty: loaded && !isLoading && !error && items.length === 0,
    /** "20+ người dùng" khi còn trang sau; rỗng khi chưa có dòng nào. */
    countLabel: items.length
      ? `${items.length}${page.hasNext ? "+" : ""} người dùng`
      : "",
    emptyHint: trimmed
      ? `Không có kết quả cho “${trimmed}”`
      : "Chưa có tài khoản nào trong hệ thống",
    loadMore,
    retry: load,
  };
}
