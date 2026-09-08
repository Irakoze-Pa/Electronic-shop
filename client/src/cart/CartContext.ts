import { createContext } from "react";
import type { Cart } from "../types/shopping";

export interface CartContextValue {
  cart: Cart;
  cartCount: number;
  subtotal: number;
  loading: boolean;
  error: string;
  busyProductId: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const emptyCart: Cart = { items: [], totalQuantity: 0, subtotal: 0 };
export const CartContext = createContext<CartContextValue | null>(null);
