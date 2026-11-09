import { toApiError } from "@/core/http/apiError";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; message: string };

/** Nơi DUY NHẤT bắt lỗi trong hook và đổi thành thông điệp cho người dùng. */
export async function runAction<T>(
    run: () => Promise<T>,
    fallback: string,
): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await run() };
    } catch (error) {
        const apiErr = toApiError(error);
        const status = apiErr.status;
        const rawMsg = apiErr.message || (error instanceof Error && error.message ? error.message : fallback);
        const lower = rawMsg.toLowerCase();

        let message = rawMsg;
        if (
            status === 409 ||
            lower.includes("already exist") ||
            lower.includes("already saved") ||
            lower.includes("already") ||
            lower.includes("duplicate") ||
            lower.includes("conflict") ||
            lower.includes("tồn tại")
        ) {
            message = "Công thức này đã có trong danh sách Đã lưu của bạn.";
        }

        return { ok: false, message };
    }
}