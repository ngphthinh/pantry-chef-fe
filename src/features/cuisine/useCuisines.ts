import { useEffect, useState } from "react";
import { cuisineService } from "@/core/di/container";
import type { CuisineResponse } from "@/types";

/** Danh sách ẩm thực; lỗi thì trả mảng rỗng (bộ lọc này không bắt buộc). */
export function useCuisines(): CuisineResponse[] {
  const [cuisines, setCuisines] = useState<CuisineResponse[]>([]);

  useEffect(() => {
    let active = true;
    cuisineService
      .list()
      .then((list) => active && setCuisines(list))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return cuisines;
}
