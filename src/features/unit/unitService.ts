import type { UnitConvertResponse } from "@/types";
import type { IUnitApi, UnitConvertQuery } from "./types";
import { areCompatible } from "./unitOptions";

export class UnitService {
  constructor(private readonly units: IUnitApi) {}

  /** Chặn sớm các trường hợp BE chắc chắn từ chối hoặc không cần tính. */
  async convert(query: UnitConvertQuery): Promise<UnitConvertResponse> {
    if (!areCompatible(query.from, query.to)) {
      throw new Error("Hai đơn vị không cùng loại (khối lượng, thể tích, số đếm) nên không thể quy đổi.");
    }
    if (query.from === query.to) {
      return { ...query, result: query.value };
    }
    return this.units.convert(query);
  }
}
