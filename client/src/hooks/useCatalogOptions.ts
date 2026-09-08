import { useCallback, useEffect, useState } from "react";
import { listBrands, listCategories } from "../api/catalog";
import type { Brand, Category } from "../types/catalog";
import { formatApiError } from "../utils/format";

export function useCatalogOptions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const [categoryData, brandData] = await Promise.all([listCategories(), listBrands()]); setCategories(categoryData); setBrands(brandData); setError(""); }
    catch (reason: unknown) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  return { categories, brands, loading, error, retry: load };
}
