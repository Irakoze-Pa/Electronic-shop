import { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authApi
      .getCurrentUser()
      .then((currentUser) => active && setUser(currentUser))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    const unauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", unauthorized);
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", unauthorized);
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const authenticatedUser = await authApi.login(input);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const authenticatedUser = await authApi.register(input);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [loading, login, logout, register, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
