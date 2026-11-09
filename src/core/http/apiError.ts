import axios from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
const FILE_TOO_LARGE =
  "Dung lượng ảnh vượt quá giới hạn cho phép của hệ thống (tối đa 10MB).";
const NETWORK_ERROR =
  "Không kết nối được tới máy chủ. Kiểm tra mạng hoặc Host API.";
function collectDetails(errors: unknown): string[] {
  if (!errors) return [];
  if (typeof errors === "string") return [errors];
  if (Array.isArray(errors)) {
    return errors.flatMap((e) => {
      if (typeof e === "string") return [e];
      const text = e?.message ?? e?.defaultMessage ?? e?.detail;
      return typeof text === "string" ? [text] : [];
    });
  }
  if (typeof errors === "object") {
    return Object.values(errors as Record<string, unknown>).flatMap(
      collectDetails,
    );
  }
  return [];
}
function extractMessage(data: unknown): string | undefined {
  if (!data) return undefined;

  if (typeof data === "string") {
    return data.trim().startsWith("<") ? undefined : data;
  }

  const body = data as Record<string, unknown>;
  const details = [
    ...collectDetails(body.errors),
    ...collectDetails(body.fieldErrors),
    ...collectDetails(body.violations),
  ];
  if (details.length > 0) return [...new Set(details)].join("\n");

  const direct = body.message ?? body.detail ?? body.error;
  return typeof direct === "string" ? direct : undefined;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    console.log("HTTP STATUS:", error.response?.status);
    console.log("HTTP RESPONSE:", error.response?.data);
    console.log("HTTP URL:", error.config?.url);
    console.log("HTTP METHOD:", error.config?.method);

    const status = error.response?.status;

    if (status === 413) {
      return new ApiError(FILE_TOO_LARGE, 413);
    }
    if (!error.response) {
      return new ApiError(NETWORK_ERROR);
    }

    const message =
      extractMessage(error.response.data) ?? `Lỗi máy chủ (${status}).`;

    return new ApiError(message, status);
  }

  return new ApiError(error instanceof Error ? error.message : "Unknown error");
}

export function getErrorMessage(error: unknown): string {
  const apiError = axios.isAxiosError(error)
    ? toApiError(error)
    : undefined;

  const raw = apiError
    ? apiError.message
    : error instanceof Error
      ? error.message
      : undefined;

  if (!raw || raw === "Unknown error") return "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";

  const msg = raw.toLowerCase();

  // 1. Quá dung lượng tải lên
  if (
    msg.includes("maximum upload size") ||
    msg.includes("payload too large") ||
    msg.includes("sizelimitexceeded") ||
    msg.includes("quá dung lượng") ||
    apiError?.status === 413
  ) {
    return FILE_TOO_LARGE;
  }

  // 2. Mạng và kết nối
  if (
    msg.includes("network error") ||
    msg.includes("failed to connect") ||
    msg.includes("network request failed") ||
    msg.includes("econnrefused")
  ) {
    return NETWORK_ERROR;
  }

  if (msg.includes("timeout") || msg.includes("econnaborted")) {
    return "Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại.";
  }

  // 3. Xác thực & Tài khoản
  if (
    msg.includes("bad credentials") ||
    msg.includes("invalid password") ||
    msg.includes("invalid email or password") ||
    msg.includes("wrong password")
  ) {
    return "Email hoặc mật khẩu không chính xác.";
  }

  if (
    apiError?.status === 401 ||
    msg.includes("jwt expired") ||
    msg.includes("token expired") ||
    msg.includes("unauthorized")
  ) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  if (apiError?.status === 403 || msg.includes("access denied") || msg.includes("forbidden")) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  if (msg.includes("user not found")) {
    return "Không tìm thấy tài khoản người dùng.";
  }

  if (msg.includes("user already exists") || msg.includes("email already in use")) {
    return "Email này đã được đăng ký cho một tài khoản khác.";
  }

  // 4. Trùng lặp & Tồn tại
  if (
    msg.includes("recipe already saved") ||
    msg.includes("saved recipe already exists")
  ) {
    return "Công thức này đã có trong danh sách Đã lưu của bạn.";
  }

  if (
    apiError?.status === 409 ||
    msg.includes("already exists") ||
    msg.includes("already exist") ||
    msg.includes("duplicate") ||
    msg.includes("conflict")
  ) {
    return "Dữ liệu này đã tồn tại trong hệ thống.";
  }

  // 5. Không tìm thấy dữ liệu
  if (apiError?.status === 404 || msg.includes("not found")) {
    if (msg.includes("recipe")) return "Không tìm thấy công thức yêu cầu.";
    if (msg.includes("pantry")) return "Không tìm thấy nguyên liệu trong tủ.";
    if (msg.includes("ingredient")) return "Không tìm thấy nguyên liệu yêu cầu.";
    if (msg.includes("meal plan")) return "Không tìm thấy thực đơn tuần yêu cầu.";
    if (msg.includes("shopping list")) return "Không tìm thấy danh sách mua sắm.";
    return "Không tìm thấy dữ liệu yêu cầu.";
  }

  // 6. Lỗi máy chủ
  if (apiError?.status === 500 || msg.includes("internal server error")) {
    return "Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau.";
  }

  if (
    apiError?.status === 502 ||
    apiError?.status === 503 ||
    apiError?.status === 504
  ) {
    return "Hệ thống máy chủ đang bận hoặc bảo trì. Vui lòng thử lại sau.";
  }

  return raw;
}
