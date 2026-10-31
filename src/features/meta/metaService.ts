import type { MetaEnumsResponse, Unit } from "@/types";
import type { IMetaApi } from "./types";

export interface MetaData {
  enums: MetaEnumsResponse;
  units: Unit[];
}

export class MetaService {
  constructor(private readonly meta: IMetaApi) {}

  load = async (): Promise<MetaData> => {
    const [enums, units] = await Promise.all([this.meta.enums(), this.meta.units()]);
    return { enums, units };
  };
}
