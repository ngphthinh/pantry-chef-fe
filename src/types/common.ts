/**
 * DTO dùng chung (org.group12.common.dto.*) + alias kiểu nguyên thủy.
 *
 * Quy ước map Java → TS (Jackson mặc định của Spring Boot):
 *  - UUID                → string
 *  - LocalDate           → string "YYYY-MM-DD"            (ISODate)
 *  - Instant             → string ISO-8601 UTC            (ISODateTime)
 *  - int/long/Double/BigDecimal → number
 *  - Response: field kiểu bọc (Integer, Double, String, object…) có thể null → `T | null`
 *  - Request : field không có @NotNull/@NotBlank là tuỳ chọn → `field?: T`
 */
import type { MediaType, Unit } from './enums';
import type {
  MeasurementSystem, ThemeMode, MealType, Difficulty, StorageLocation, ShoppingItemStatus,
} from './enums';

export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

/** Mọi endpoint thành công đều bọc trong ApiResponse. Endpoint trả Void thì data = null. */
export interface ApiResponse<T = null> {
  code: string;
  message: string;
  data: T;
}

/** Phân trang cursor: ?cursor=<nextCursor>&size=20 (size tối đa 50). */
export interface CursorResponse<T> {
  content: T[];
  hasNext: boolean;
  nextCursor: string | null;
}

/** Lỗi do GlobalExceptionHandler trả (JsonInclude NON_NULL nên các field có thể vắng mặt). */
export interface ErrorResponse {
  timestamp?: ISODateTime;
  status: number;
  error?: string;
  message?: string;
  path?: string;
  /** Lỗi validate theo từng field: { fieldName: message } */
  errors?: Record<string, string>;
}

export interface MetaEnumsResponse {
  unit: Unit[];
  mealType: MealType[];
  difficulty: Difficulty[];
  storageLocation: StorageLocation[];
  shoppingItemStatus: ShoppingItemStatus[];
  measurementSystem: MeasurementSystem[];
  themeMode: ThemeMode[];
}

export interface UnitConvertResponse {
  value: number;
  from: Unit;
  to: Unit;
  result: number;
}

export interface UploadMediaResponse {
  publicId: string;
  url: string;
  mediaType: MediaType;
}

export interface UserStatsResponse {
  savedRecipeCount: number;
  collectionCount: number;
  cookedCount: number;
  wastedItemCount: number;
}

/**
 * Thay cho MultipartFile (ImageUploadRequest của ai / pantry / recipe — cả 3 giống nhau).
 * Gửi bằng multipart/form-data, field tên "image" (riêng avatar user là "avatar"), tối đa 10MB.
 * Với React Native: append({ uri, name, type }) vào FormData.
 */
export interface ImageUploadFile {
  uri: string;
  name: string;
  type: string;
}
export interface ImageUploadRequest {
  image: ImageUploadFile;
}
