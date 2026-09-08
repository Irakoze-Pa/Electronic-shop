import { useCallback, useEffect, useMemo, useState } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "../auth/useAuth";
import type { Cart } from "../types/shopping";
import { formatApiError } from "../utils/format";
import { CartContext, emptyCart } from "./CartContext";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user) { setCart(emptyCart); setError(""); return; }
    setLoading(true);
    try { setCart(await cartApi.getCart()); setError(""); }
    catch (reason: unknown) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const timeout = window.setTimeout(() => void refreshCart(), 0);
    return () => window.clearTimeout(timeout);
  }, [authLoading, refreshCart]);

  const mutate = useCallback(async (productId: string, action: () => Promise<Cart>) => {
    if (busyProductId) return;
    setBusyProductId(productId); setError("");
    try { setCart(await action()); }
    catch (reason: unknown) { const message = formatApiError(reason); setError(message); throw reason; }
    finally { setBusyProductId(null); }
  }, [busyProductId]);

  const value = useMemo(() => ({
    cart, cartCount: cart.totalQuantity, subtotal: cart.subtotal, loading, error,
    busyProductId,
    addToCart: (id: string, quantity = 1) => mutate(id, () => cartApi.addCartItem(id, quantity)),
    updateQuantity: (id: string, quantity: number) => mutate(id, () => cartApi.updateCartItem(id, quantity)),
    removeFromCart: (id: string) => mutate(id, () => cartApi.removeCartItem(id)),
    clearCart: async () => { setLoading(true); setError(""); try { setCart(await cartApi.clearCart()); } catch (reason: unknown) { setError(formatApiError(reason)); throw reason; } finally { setLoading(false); } },
    refreshCart,
  }), [busyProductId, cart, error, loading, mutate, refreshCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
