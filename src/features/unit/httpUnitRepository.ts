import type { AxiosInstance } from "axios";

import type { UnitConvertResponse } from "@/types";
import type { IUnitApi, UnitConvertQuery } from "./types";

export class HttpUnitRepository implements IUnitApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  convert = async (query: UnitConvertQuery): Promise<UnitConvertResponse> => {
    const { data } = await this.privateHttp.get<UnitConvertResponse>("/v1/units/convert", {
      params: query,
    });
    return data;
  };
}
