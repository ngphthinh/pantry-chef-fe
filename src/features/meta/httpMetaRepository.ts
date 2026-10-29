import type { AxiosInstance } from "axios";

import type { MetaEnumsResponse, Unit } from "@/types";
import type { IMetaApi } from "./types";

export class HttpMetaRepository implements IMetaApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  enums = async (): Promise<MetaEnumsResponse> => {
    const { data } = await this.privateHttp.get<MetaEnumsResponse>("/v1/meta/enums");
    return data;
  };

  units = async (): Promise<Unit[]> => {
    const { data } = await this.privateHttp.get<Unit[]>("/v1/meta/units");
    return data;
  };
}
