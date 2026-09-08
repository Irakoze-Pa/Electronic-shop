export const catalogStatuses = ["Active", "Inactive"] as const;
export type CatalogStatus = (typeof catalogStatuses)[number];

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
