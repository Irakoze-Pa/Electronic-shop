import { http } from "./http";
import type { ApiResponse } from "../types/catalog";
import type { Cart } from "../types/shopping";

export async function getCart() {
  const { data } = await http.get<ApiResponse<Cart>>("/cart");
  return data.data;
}
export async function addCartItem(productId: string, quantity: number) {
  const { data } = await http.post<ApiResponse<Cart>>("/cart/items", {
    productId,
    quantity,
  });
  return data.data;
}
export async function updateCartItem(productId: string, quantity: number) {
  const { data } = await http.patch<ApiResponse<Cart>>(
    `/cart/items/${productId}`,
    { quantity },
  );
  return data.data;
}
export async function removeCartItem(productId: string) {
  const { data } = await http.delete<ApiResponse<Cart>>(
    `/cart/items/${productId}`,
  );
  return data.data;
}
export async function clearCart() {
  const { data } = await http.delete<ApiResponse<Cart>>("/cart");
  return data.data;
}
