import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  FEEDBACK_TYPE_LABELS,
  formatDateTime,
  getErrorMessage,
} from "./adminFormat";
import { fetchAdminFeedback } from "./adminSlice";
import type { FeedbackTypeFilter } from "./types";

const PAGE_SIZE = 20; // API cho phép 1-30
const SEARCH_DELAY_MS = 400;

/** Nhóm màu của loại phản hồi; màn hình quyết định màu cụ thể. */
export type FeedbackTone = "bug" | "suggestion" | "other";

const toTone = (type: string): FeedbackTone =>
  type === "BUG" ? "bug" : type === "SUGGESTION" ? "suggestion" : "other";

export interface AdminFeedbackItem {
  key: string;
  typeLabel: string;
  tone: FeedbackTone;
  message: string;
  author: string;
  dateLabel: string;
  deviceLabel: string;
}

export interface FeedbackTypeOption {
  key: string;
  label: string;
  selected: boolean;
  value: FeedbackTypeFilter | undefined;
}

const TYPE_OPTIONS: { label: string; value: FeedbackTypeFilter | undefined }[] =
  [
    { label: "Tất cả", value: undefined },
    { label: "Lỗi", value: "BUG" },
    { label: "Đề xuất", value: "SUGGESTION" },
    { label: "Khác", value: "OTHER" },
  ];

export function useAdminFeedback() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((s) => s.admin.feedback);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<FeedbackTypeFilter | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const query = useMemo(
    () => ({ keyword: keyword.trim() || undefined, type, size: PAGE_SIZE }),
    [keyword, type],
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchAdminFeedback(query));
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được phản hồi."));
    } finally {
      setLoaded(true);
    }
  }, [dispatch, query]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), keyword ? SEARCH_DELAY_MS : 0);
    return () => clearTimeout(timer);
  }, [keyword, load]);

  const loadMore = useCallback(async () => {
    try {
      await dispatch(fetchAdminFeedback(query, true));
    } catch (e) {
      setError(getErrorMessage(e, "Không tải thêm được."));
    }
  }, [dispatch, query]);

  const typeOptions = useMemo<FeedbackTypeOption[]>(
    () =>
      TYPE_OPTIONS.map((o) => ({
        key: o.value ?? "ALL",
        label: o.label,
        value: o.value,
        selected: o.value === type,
      })),
    [type],
  );

  const items = useMemo<AdminFeedbackItem[]>(
    () =>
      page.items.map((f) => ({
        key: f.id,
        typeLabel: FEEDBACK_TYPE_LABELS[f.type] ?? f.type,
        tone: toTone(f.type),
        message: f.message,
        author:
          [f.user?.displayName?.trim(), f.user?.email]
            .filter(Boolean)
            .join(" · ") || "Ẩn danh",
        dateLabel: formatDateTime(f.createdAt),
        deviceLabel: [f.appVersion, f.deviceInfo].filter(Boolean).join(" · "),
      })),
    [page.items],
  );

  const isLoading = page.status === "loading";

  return {
    items,
    keyword,
    setKeyword,
    typeOptions,
    setType,
    error,
    hasNext: page.hasNext,
    isLoading,
    isLoadingMore: page.status === "loadingMore",
    isEmpty: loaded && !isLoading && !error && items.length === 0,
    loadMore,
    retry: load,
  };
}
