import type { CatalogStatus } from "../shared/catalog.types.js";

export interface CategoryInput {
  name: string;
  description?: string;
  image?: string;
  status: CatalogStatus;
}
