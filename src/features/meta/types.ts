import type { MetaEnumsResponse, Unit } from "@/types";

export interface IMetaApi {
  enums(): Promise<MetaEnumsResponse>;
  units(): Promise<Unit[]>;
}
