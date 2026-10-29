import { useCallback, useMemo, useRef, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { IngredientResponse } from "@/types";
import { lookupIngredientByBarcode } from "./ingredientSlice";
import { ingredientValidators } from "./validation";

/**
 * Tra nguyên liệu theo mã vạch (quét camera hoặc nhập tay).
 * `lookup` trả nguyên liệu khi tìm thấy, `null` khi không; thông điệp lỗi nằm ở `error`.
 */
export function useBarcodeLookup() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.ingredient.status);

  const [manualCode, setManualCode] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera báo cùng một mã nhiều lần liên tiếp, chỉ xử lý lần đầu cho tới khi `reset`.
  const busy = useRef(false);

  const lookup = useCallback(
    async (code: string): Promise<IngredientResponse | null> => {
      if (busy.current) return null;
      busy.current = true;
      setLastCode(code.trim());
      setError(null);

      const result = await runAction(
        () => dispatch(lookupIngredientByBarcode(code)),
        "Không tra được mã vạch. Vui lòng thử lại.",
      );
      if (result.ok) return result.data; // giữ `busy` để không xử lý lại trong lúc chuyển màn hình

      setError(result.message);
      busy.current = false;
      return null;
    },
    [dispatch],
  );

  const submitManual = useCallback(async (): Promise<IngredientResponse | null> => {
    const invalid = ingredientValidators.barcode(manualCode);
    if (invalid) {
      setError(invalid);
      return null;
    }
    return lookup(manualCode);
  }, [lookup, manualCode]);

  /** Cho phép quét mã tiếp theo. */
  const reset = useCallback(() => {
    busy.current = false;
    setLastCode(null);
    setError(null);
  }, []);

  return useMemo(
    () => ({
      manualCode,
      setManualCode,
      lastCode,
      error,
      isLooking: status === "lookingUp",
      lookup,
      submitManual,
      reset,
    }),
    [manualCode, lastCode, error, status, lookup, submitManual, reset],
  );
}
