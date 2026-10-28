import { useCallback, useMemo, useState } from "react";
import { formatDecimal, parseDecimal } from "@/core/format/decimal";
import type { ActionResult } from "@/core/http/actionResult";
import { Unit, type UnitConvertResponse } from "@/types";
import { compatibleUnits, unitLabel } from "./unitOptions";
import { useUnit } from "./useUnit";
import { unitValidators } from "./validation";

interface FormValues {
  value: string;
  from: Unit;
  to: Unit;
}

const INITIAL: FormValues = { value: "1", from: Unit.KG, to: Unit.G };

export function useUnitConverterForm() {
  const { result, isConverting, convert, clear } = useUnit();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  /** Đổi đầu vào thì kết quả cũ không còn đúng nữa. */
  const change = useCallback(
    (patch: Partial<FormValues>) => {
      setValues((prev) => ({ ...prev, ...patch }));
      setError(null);
      clear();
    },
    [clear],
  );

  const setValue = useCallback((value: string) => change({ value }), [change]);
  const setTo = useCallback((to: Unit) => change({ to }), [change]);

  /** Đổi đơn vị gốc thì đơn vị đích phải còn cùng nhóm, nếu không thì chọn lại đơn vị đầu tiên cùng nhóm. */
  const setFrom = useCallback(
    (from: Unit) => {
      setValues((prev) => {
        const options = compatibleUnits(from);
        const to = options.some((o) => o.value === prev.to) ? prev.to : (options[0]?.value ?? prev.to);
        return { ...prev, from, to };
      });
      setError(null);
      clear();
    },
    [clear],
  );

  const swap = useCallback(() => {
    setValues((prev) => ({ ...prev, from: prev.to, to: prev.from }));
    setError(null);
    clear();
  }, [clear]);

  const submit = useCallback(async (): Promise<ActionResult<UnitConvertResponse>> => {
    const invalid = unitValidators.value(values.value);
    if (invalid) {
      setError(invalid);
      return { ok: false, message: invalid };
    }
    const response = await convert({
      value: parseDecimal(values.value) ?? 0,
      from: values.from,
      to: values.to,
    });
    if (!response.ok) setError(response.message);
    return response;
  }, [convert, values]);

  const toOptions = useMemo(() => compatibleUnits(values.from), [values.from]);

  /** "1 kg = 1000 g" — chuỗi hiển thị nằm ở hook, màn hình không tự ghép. */
  const resultText = useMemo(
    () =>
      result
        ? `${formatDecimal(result.value)} ${unitLabel(result.from)} = ${formatDecimal(result.result)} ${unitLabel(result.to)}`
        : null,
    [result],
  );

  return {
    values,
    error,
    toOptions,
    resultText,
    isConverting,
    setValue,
    setFrom,
    setTo,
    swap,
    submit,
  };
}
