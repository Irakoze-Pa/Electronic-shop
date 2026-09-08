import { http } from "./http";
import type { ApiResponse, Brand, Category, Product, ProductFilters, ProductInput, ProductListResponse, UploadedImage } from "../types/catalog";

export async function listCategories() { const { data } = await http.get<ApiResponse<Category[]>>("/categories"); return data.data; }
export async function createCategory(input: Pick<Category, "name" | "description" | "image" | "status">) { const { data } = await http.post<ApiResponse<Category>>("/categories", input); return data.data; }
export async function updateCategory(id: string, input: Partial<Pick<Category, "name" | "description" | "image" | "status">>) { const { data } = await http.patch<ApiResponse<Category>>(`/categories/${id}`, input); return data.data; }
export async function deleteCategory(id: string) { await http.delete(`/categories/${id}`); }
export async function listBrands() { const { data } = await http.get<ApiResponse<Brand[]>>("/brands"); return data.data; }
export async function createBrand(input: Pick<Brand, "name" | "description" | "logo" | "status">) { const { data } = await http.post<ApiResponse<Brand>>("/brands", input); return data.data; }
export async function updateBrand(id: string, input: Partial<Pick<Brand, "name" | "description" | "logo" | "status">>) { const { data } = await http.patch<ApiResponse<Brand>>(`/brands/${id}`, input); return data.data; }
export async function deleteBrand(id: string) { await http.delete(`/brands/${id}`); }
export async function listProducts(filters: ProductFilters = {}) { const { data } = await http.get<ProductListResponse>("/products", { params: filters }); return data; }
export async function getProduct(id: string) { const { data } = await http.get<ApiResponse<Product>>(`/products/${id}`); return data.data; }
export async function createProduct(input: ProductInput) { const { data } = await http.post<ApiResponse<Product>>("/products", input); return data.data; }
export async function updateProduct(id: string, input: Partial<ProductInput>) { const { data } = await http.patch<ApiResponse<Product>>(`/products/${id}`, input); return data.data; }
export async function deleteProduct(id: string) { await http.delete(`/products/${id}`); }
export async function uploadImage(file: File) { const { data } = await http.post<ApiResponse<UploadedImage>>("/uploads/images", file, { headers: { "Content-Type": file.type } }); return data.data; }
