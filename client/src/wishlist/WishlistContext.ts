import { createContext } from "react";
import type { Wishlist } from "../types/shopping";

export interface WishlistContextValue {
  wishlist: Wishlist;
  wishlistCount: number;
  loading: boolean;
  error: string;
  busyProductId: string | null;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}
export const emptyWishlist: Wishlist = { products: [] };
export const WishlistContext = createContext<WishlistContextValue | null>(null);
