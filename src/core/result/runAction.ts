export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; message: string };

/** Nơi DUY NHẤT bắt lỗi trong hook và đổi thành thông điệp cho người dùng. */
export async function runAction<T>(
    run: () => Promise<T>,
    fallback: string,
): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await run() };
    } catch (error) {
        const message = error instanceof Error && error.message ? error.message : fallback;
        return { ok: false, message };
    }
}