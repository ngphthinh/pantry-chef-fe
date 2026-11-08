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
  const message = axios.isAxiosError(error)
    ? toApiError(error).message
    : error instanceof Error
      ? error.message
      : undefined;

  if (!message) return "Đã xảy ra lỗi. Vui lòng thử lại.";

  const msg = message.toLowerCase();
  if (
    msg.includes("maximum upload size") ||
    msg.includes("payload too large") ||
    msg.includes("sizelimitexceeded") ||
    msg.includes("quá dung lượng")
  ) {
    return FILE_TOO_LARGE;
  }

  return message;
}
