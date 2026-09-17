import { http } from "./http";
import type { ApiResponse } from "../types/catalog";
import type { Address, AddressInput } from "../types/orders";
export async function listAddresses() {
  const { data } = await http.get<ApiResponse<Address[]>>("/addresses");
  return data.data;
}
export async function createAddress(input: AddressInput) {
  const { data } = await http.post<ApiResponse<Address>>("/addresses", input);
  return data.data;
}
export async function updateAddress(id: string, input: Partial<AddressInput>) {
  const { data } = await http.patch<ApiResponse<Address>>(
    `/addresses/${id}`,
    input,
  );
  return data.data;
}
export async function deleteAddress(id: string) {
  await http.delete(`/addresses/${id}`);
}
export async function setDefaultAddress(id: string) {
  const { data } = await http.patch<ApiResponse<Address>>(
    `/addresses/${id}/default`,
  );
  return data.data;
}
