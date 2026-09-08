import type { CatalogStatus, PaginationMeta } from "../shared/catalog.types.js";

export interface ProductInput {
  name: string;
  code: string;
  category: string;
  brand: string;
  shortDescription?: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  unit: string;
  status: CatalogStatus;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  images: string[];
  specifications: Record<string, string>;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  status?: CatalogStatus;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  sort: "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc";
  page: number;
  limit: number;
}

export interface PaginatedProducts<T> {
  items: T[];
  pagination: PaginationMeta;
}
