import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { adminService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { FeedbackResponse, UserResponse } from "@/types";
import type { AdminFeedbackQuery, AdminUsersQuery } from "./types";

/** unknown: chưa kiểm tra · checking: đang hỏi server · admin / user: kết quả. */
export type AdminAccess = "unknown" | "checking" | "admin" | "user";
export type ListStatus = "idle" | "loading" | "loadingMore";

interface PagedState<T> {
  items: T[];
  hasNext: boolean;
  nextCursor?: string;
  status: ListStatus;
}

interface PagePayload<T> {
  items: T[];
  hasNext: boolean;
  nextCursor?: string;
  /** true: thay toàn bộ danh sách (tải lại); false: nối thêm (tải trang kế). */
  replace: boolean;
}

interface AdminState {
  access: AdminAccess;
  users: PagedState<UserResponse>;
  feedback: PagedState<FeedbackResponse>;
}

const emptyPage = {
  items: [],
  hasNext: false,
  nextCursor: undefined,
  status: "idle" as ListStatus,
};

const initialState: AdminState = {
  access: "unknown",
  users: { ...emptyPage },
  feedback: { ...emptyPage },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    accessChanged(state, action: PayloadAction<AdminAccess>) {
      state.access = action.payload;
    },

    usersStatusChanged(state, action: PayloadAction<ListStatus>) {
      state.users.status = action.payload;
    },
    usersPageLoaded(state, action: PayloadAction<PagePayload<UserResponse>>) {
      const { items, hasNext, nextCursor, replace } = action.payload;
      state.users.items = replace ? items : [...state.users.items, ...items];
      state.users.hasNext = hasNext;
      state.users.nextCursor = nextCursor;
    },

    feedbackStatusChanged(state, action: PayloadAction<ListStatus>) {
      state.feedback.status = action.payload;
    },
    feedbackPageLoaded(
      state,
      action: PayloadAction<PagePayload<FeedbackResponse>>,
    ) {
      const { items, hasNext, nextCursor, replace } = action.payload;
      state.feedback.items = replace
        ? items
        : [...state.feedback.items, ...items];
      state.feedback.hasNext = hasNext;
      state.feedback.nextCursor = nextCursor;
    },
  },
  // Đăng xuất thì xoá quyền và dữ liệu quản trị, tránh lộ sang tài khoản khác
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  accessChanged,
  usersStatusChanged,
  usersPageLoaded,
  feedbackStatusChanged,
  feedbackPageLoaded,
} = adminSlice.actions;
export default adminSlice.reducer;

/* Thunk thường: lỗi gốc (ApiError) được ném nguyên cho hook xử lý. */

/** Kiểm tra quyền admin một lần cho mỗi phiên đăng nhập. */
export const checkAdminAccess =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    if (getState().admin.access !== "unknown") return;

    dispatch(accessChanged("checking"));
    try {
      dispatch(accessChanged((await adminService.isAdmin()) ? "admin" : "user"));
    } catch {
      // Không xác minh được thì coi như không phải admin (an toàn hơn là mở quyền)
      dispatch(accessChanged("user"));
    }
  };

export const fetchAdminUsers =
  (
    query: Omit<AdminUsersQuery, "cursor"> = {},
    loadMore = false,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor, status } = getState().admin.users;
    if (loadMore && (!hasNext || status !== "idle")) return;

    dispatch(usersStatusChanged(loadMore ? "loadingMore" : "loading"));
    try {
      const page = await adminService.listUsers({
        ...query,
        cursor: loadMore ? nextCursor : undefined,
      });
      dispatch(
        usersPageLoaded({
          items: page.content,
          hasNext: page.hasNext,
          nextCursor: page.nextCursor ?? undefined, // API có thể trả null
          replace: !loadMore,
        }),
      );
    } finally {
      dispatch(usersStatusChanged("idle"));
    }
  };

export const fetchAdminFeedback =
  (
    query: Omit<AdminFeedbackQuery, "cursor"> = {},
    loadMore = false,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor, status } = getState().admin.feedback;
    if (loadMore && (!hasNext || status !== "idle")) return;

    dispatch(feedbackStatusChanged(loadMore ? "loadingMore" : "loading"));
    try {
      const page = await adminService.listFeedback({
        ...query,
        cursor: loadMore ? nextCursor : undefined,
      });
      dispatch(
        feedbackPageLoaded({
          items: page.content,
          hasNext: page.hasNext,
          nextCursor: page.nextCursor ?? undefined, // API có thể trả null
          replace: !loadMore,
        }),
      );
    } finally {
      dispatch(feedbackStatusChanged("idle"));
    }
  };