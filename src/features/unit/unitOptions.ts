import { formatDecimal } from "@/core/format/decimal";
import { Unit } from "@/types";

/** Khớp UnitConversionService của BE: chỉ quy đổi được giữa các đơn vị cùng nhóm. */
export type UnitGroup = "MASS" | "VOLUME" | "COUNT";

export interface UnitOption {
  value: Unit;
  label: string;
  group: UnitGroup;
}

export const UNIT_OPTIONS: readonly UnitOption[] = [
  { value: Unit.MG, label: "mg", group: "MASS" },
  { value: Unit.G, label: "g", group: "MASS" },
  { value: Unit.KG, label: "kg", group: "MASS" },
  { value: Unit.ML, label: "ml", group: "VOLUME" },
  { value: Unit.L, label: "l", group: "VOLUME" },
  { value: Unit.TSP, label: "muỗng cà phê", group: "VOLUME" },
  { value: Unit.TBSP, label: "muỗng canh", group: "VOLUME" },
  { value: Unit.CUP, label: "cốc", group: "VOLUME" },
  { value: Unit.PINCH, label: "nhúm", group: "VOLUME" },
  { value: Unit.PCS, label: "cái", group: "COUNT" },
];

const BY_VALUE = new Map(UNIT_OPTIONS.map((option) => [option.value, option]));

export const unitLabel = (unit: Unit): string => BY_VALUE.get(unit)?.label ?? unit;

export const areCompatible = (from: Unit, to: Unit): boolean =>
  BY_VALUE.get(from)?.group === BY_VALUE.get(to)?.group;

/** Các đơn vị có thể quy đổi sang `from` (cùng nhóm, trừ chính nó). */
export const compatibleUnits = (from: Unit): UnitOption[] =>
  UNIT_OPTIONS.filter((option) => option.value !== from && areCompatible(from, option.value));

/** "2 kg", "1.5 muỗng canh"; không có số lượng thì trả chuỗi rỗng. */
export const formatQuantity = (quantity: number | null, unit: Unit | null): string => {
  if (quantity === null) return "";
  const amount = formatDecimal(quantity);
  return unit ? `${amount} ${unitLabel(unit)}` : amount;
};
