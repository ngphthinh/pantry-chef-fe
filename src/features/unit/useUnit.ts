import { useCallback, useMemo } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { UnitConvertQuery } from "./types";
import { convertUnit, resultCleared } from "./unitSlice";

export function useUnit() {
  const dispatch = useAppDispatch();
  const result = useAppSelector((s) => s.unit.result);
  const status = useAppSelector((s) => s.unit.status);

  const convert = useCallback(
    (query: UnitConvertQuery) =>
      runAction(() => dispatch(convertUnit(query)), "Không thể quy đổi đơn vị."),
    [dispatch],
  );
  const clear = useCallback(() => dispatch(resultCleared()), [dispatch]);

  return useMemo(
    () => ({ result, isConverting: status === "converting", convert, clear }),
    [result, status, convert, clear],
  );
}
