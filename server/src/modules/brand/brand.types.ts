import type { CatalogStatus } from "../shared/catalog.types.js";

export interface BrandInput {
  name: string;
  description?: string;
  logo?: string;
  status: CatalogStatus;
}
