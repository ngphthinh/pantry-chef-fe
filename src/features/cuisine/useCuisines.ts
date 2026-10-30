import { useEffect } from "react";
import type { CuisineResponse } from "@/types";
import { useCuisine } from "./useCuisine";

/**
 * Giữ cho các màn hình đang gọi `useCuisines()` (ví dụ ai/meal-plan): tự tải khi mở màn hình và
 * trả về mảng ẩm thực, lỗi thì mảng rỗng vì bộ lọc này không bắt buộc. Code mới nên dùng useCuisine.
 */
export function useCuisines(): CuisineResponse[] {
  const { items, load } = useCuisine();

  useEffect(() => {
    void load();
  }, [load]);

  return items;
}
