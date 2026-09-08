import { useCallback, useEffect, useMemo, useState } from "react";
import * as wishlistApi from "../api/wishlist";
import { useAuth } from "../auth/useAuth";
import type { Wishlist } from "../types/shopping";
import { formatApiError } from "../utils/format";
import { emptyWishlist, WishlistContext } from "./WishlistContext";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist>(emptyWishlist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const refreshWishlist = useCallback(async () => {
    if (!user) { setWishlist(emptyWishlist); setError(""); return; }
    setLoading(true);
    try { setWishlist(await wishlistApi.getWishlist()); setError(""); }
    catch (reason: unknown) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => {
    if (authLoading) return;
    const timeout = window.setTimeout(() => void refreshWishlist(), 0);
    return () => window.clearTimeout(timeout);
  }, [authLoading, refreshWishlist]);
  const isWishlisted = useCallback((id: string) => wishlist.products.some((product) => product._id === id), [wishlist.products]);
  const mutate = useCallback(async (id: string, action: () => Promise<Wishlist>) => {
    if (busyProductId) return;
    setBusyProductId(id); setError("");
    try { setWishlist(await action()); }
    catch (reason: unknown) { setError(formatApiError(reason)); throw reason; }
    finally { setBusyProductId(null); }
  }, [busyProductId]);
  const value = useMemo(() => ({
    wishlist, wishlistCount: wishlist.products.length, loading, error, busyProductId, isWishlisted,
    addToWishlist: (id: string) => mutate(id, () => wishlistApi.addWishlistItem(id)),
    removeFromWishlist: (id: string) => mutate(id, () => wishlistApi.removeWishlistItem(id)),
    toggleWishlist: (id: string) => mutate(id, () => isWishlisted(id) ? wishlistApi.removeWishlistItem(id) : wishlistApi.addWishlistItem(id)),
    clearWishlist: async () => { setLoading(true); try { setWishlist(await wishlistApi.clearWishlist()); setError(""); } catch (reason: unknown) { setError(formatApiError(reason)); throw reason; } finally { setLoading(false); } },
    refreshWishlist,
  }), [busyProductId, error, isWishlisted, loading, mutate, refreshWishlist, wishlist]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
