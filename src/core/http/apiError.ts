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

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    console.log("HTTP STATUS:", error.response?.status);
    console.log("HTTP RESPONSE:", error.response?.data);
    console.log("HTTP URL:", error.config?.url);
    console.log("HTTP METHOD:", error.config?.method);

    const data = error.response?.data;

    if (error.response?.status === 413) {
      return new ApiError(
        "Dung lượng ảnh vượt quá giới hạn cho phép của hệ thống (tối đa 10MB).",
        413,
      );
    }

    const message =
      data?.message ??
      data?.detail ??
      data?.error ??
      error.message ??
      "Unknown API error";

    return new ApiError(message, error.response?.status);
  }

  return new ApiError(error instanceof Error ? error.message : "Unknown error");
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 413) {
    return "Dung lượng ảnh vượt quá giới hạn cho phép của hệ thống (tối đa 10MB).";
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("maximum upload size") ||
      msg.includes("payload too large") ||
      msg.includes("sizelimitexceeded") ||
      msg.includes("quá dung lượng")
    ) {
      return "Dung lượng ảnh vượt quá giới hạn cho phép của hệ thống (tối đa 10MB).";
    }
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}
