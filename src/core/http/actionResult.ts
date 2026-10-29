import { ApiError, getErrorMessage } from "./apiError";

/** Kết quả của một hành động để màn hình chỉ việc hiển thị, không phải tự try/catch. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  /** `status` là mã HTTP của BE (nếu lỗi đến từ BE), để hook đổi thông báo theo mã. */
  | { ok: false; message: string; status?: number };

/** Bắt lỗi MỘT lần ở hook và đổi thành thông điệp cho người dùng (README mục 6.4). */
export async function runAction<T>(
  task: () => Promise<T>,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await task() };
  } catch (error) {
    const message = getErrorMessage(error);
    return {
      ok: false,
      message: message || fallbackMessage,
      status: error instanceof ApiError ? error.status : undefined,
    };
  }
}
