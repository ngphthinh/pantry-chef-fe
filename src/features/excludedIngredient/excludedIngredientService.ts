import type { ExcludedIngredientResponse } from "@/types";
import type { IExcludedIngredientApi } from "./types";
import { cleanName } from "./validation";

export class ExcludedIngredientService {
  constructor(private readonly excluded: IExcludedIngredientApi) {}

  list = (): Promise<ExcludedIngredientResponse[]> => this.excluded.list();

  add = (name: string): Promise<ExcludedIngredientResponse> =>
    this.excluded.add({ name: cleanName(name) });

  remove = (id: string): Promise<void> => this.excluded.remove(id);
}
