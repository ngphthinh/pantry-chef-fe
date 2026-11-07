export const MAX_IMAGE_FILE_SIZE_MB = 10;
export const MAX_IMAGE_FILE_SIZE_BYTES = MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Kiểm tra dung lượng ảnh trước khi tải lên (Client-side validation)
 * Ngăn chặn người dùng tải lên ảnh vượt quá dung lượng tối đa cho phép (mặc định 10MB).
 */
export function validateImageSize(
  asset?: { fileSize?: number | null; uri?: string } | null,
  maxMb: number = MAX_IMAGE_FILE_SIZE_MB,
): ImageValidationResult {
  if (!asset) return { valid: true };

  if (asset.fileSize && asset.fileSize > maxMb * 1024 * 1024) {
    const sizeInMb = (asset.fileSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Ảnh bạn chọn có dung lượng ${sizeInMb}MB, vượt quá giới hạn cho phép (tối đa ${maxMb}MB). Vui lòng chọn ảnh có dung lượng nhỏ hơn.`,
    };
  }

  return { valid: true };
}

