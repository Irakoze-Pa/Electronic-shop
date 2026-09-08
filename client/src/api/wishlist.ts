import { http } from "./http";
import type { ApiResponse } from "../types/catalog";
import type { Wishlist } from "../types/shopping";

export async function getWishlist() {
  const { data } = await http.get<ApiResponse<Wishlist>>("/wishlist");
  return data.data;
}
export async function addWishlistItem(productId: string) {
  const { data } = await http.post<ApiResponse<Wishlist>>(
    `/wishlist/${productId}`,
  );
  return data.data;
}
export async function removeWishlistItem(productId: string) {
  const { data } = await http.delete<ApiResponse<Wishlist>>(
    `/wishlist/${productId}`,
  );
  return data.data;
}
export async function clearWishlist() {
  const { data } = await http.delete<ApiResponse<Wishlist>>("/wishlist");
  return data.data;
}
