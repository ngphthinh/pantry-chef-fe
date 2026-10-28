import type { Unit, UnitConvertResponse } from "@/types";

export interface UnitConvertQuery {
  /** >= 0 */
  value: number;
  from: Unit;
  to: Unit;
}

export interface IUnitApi {
  convert(query: UnitConvertQuery): Promise<UnitConvertResponse>;
}
