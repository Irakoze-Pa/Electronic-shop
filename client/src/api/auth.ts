import type { ApiResponse } from "../types/catalog";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";
import { http } from "./http";

export async function login(input: LoginInput) {
  const { data } = await http.post<ApiResponse<AuthUser>>("/auth/login", input);
  return data.data;
}

export async function register(input: RegisterInput) {
  const { data } = await http.post<ApiResponse<AuthUser>>(
    "/auth/register",
    input,
  );
  return data.data;
}

export async function getCurrentUser() {
  const { data } = await http.get<ApiResponse<AuthUser>>("/auth/me");
  return data.data;
}

export async function logout() {
  await http.post("/auth/logout");
}
