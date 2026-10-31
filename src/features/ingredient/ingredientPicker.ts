import type { IngredientResponse } from "@/types";
import type { PickedIngredient } from "./types";

/** Đổi nguyên liệu API thành thông tin trả về cho màn hình gọi. */
export const toPickedIngredient = (ingredient: IngredientResponse): PickedIngredient => ({
  ingredientId: ingredient.id,
  ingredientName: ingredient.name,
  defaultUnit: ingredient.defaultUnit,
});

/** Tham số route của `pantry/new` (màn hình này đọc `ingredientId`, `ingredientName`, `defaultUnit`). */
export const toPantryNewParams = (picked: PickedIngredient) => ({
  ingredientId: picked.ingredientId,
  ingredientName: picked.ingredientName,
  defaultUnit: picked.defaultUnit ?? "G",
});

type Listener = (picked: PickedIngredient) => void;

let pending: Listener | null = null;

/**
 * Dùng khi màn hình gọi KHÔNG muốn bị thay thế (ví dụ `pantry/scan-review` đang giữ danh sách đã quét):
 *
 *   ingredientPicker.request((picked) => { ... gán ingredientId cho món đang sửa ... });
 *   router.push({ pathname: "/pantry/select-ingredient", params: { pick: "1" } });
 *
 * Màn hình chọn sẽ gọi `resolve` rồi tự quay lại (router.back). Thoát mà không chọn thì `cancel`.
 */
export const ingredientPicker = {
  request(listener: Listener): void {
    pending = listener;
  },
  resolve(picked: PickedIngredient): void {
    const listener = pending;
    pending = null;
    listener?.(picked);
  },
  cancel(): void {
    pending = null;
  },
  hasPending: (): boolean => pending !== null,
};
