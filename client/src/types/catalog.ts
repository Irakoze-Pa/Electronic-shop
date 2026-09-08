export type CatalogStatus = "Active" | "Inactive";
export interface Category { _id: string; name: string; slug: string; description: string; image: string; status: CatalogStatus; createdAt: string; updatedAt: string }
export interface Brand { _id: string; name: string; slug: string; description: string; logo: string; status: CatalogStatus; createdAt: string; updatedAt: string }
export interface Product {
  _id: string; name: string; slug: string; code: string;
  category: Pick<Category, "_id" | "name" | "slug" | "status">;
  brand: Pick<Brand, "_id" | "name" | "slug" | "status">;
  shortDescription: string; description: string; price: number; oldPrice: number | null;
  stock: number; unit: string; status: CatalogStatus; featured: boolean; bestSeller: boolean;
  newArrival: boolean; images: string[]; specifications: Record<string, string>; createdAt: string; updatedAt: string;
}
export interface ProductInput { name: string; code: string; category: string; brand: string; shortDescription: string; description: string; price: number; oldPrice: number | null; stock: number; unit: string; status: CatalogStatus; featured: boolean; bestSeller: boolean; newArrival: boolean; images: string[]; specifications: Record<string, string> }
export interface Pagination { page: number; limit: number; total: number; pages: number }
export interface ApiResponse<T> { success: boolean; data: T; message?: string }
export interface ProductListResponse extends ApiResponse<Product[]> { pagination: Pagination }
export interface ProductFilters { search?: string; category?: string; brand?: string; status?: CatalogStatus; featured?: boolean; bestSeller?: boolean; newArrival?: boolean; sort?: "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc"; page?: number; limit?: number }
export interface UploadedImage { url: string; publicId: string; width: number; height: number; format: string }
