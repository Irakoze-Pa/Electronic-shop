import { useState } from "react";
import type { Product } from "../../types/catalog";
import { categoryPhoto, isCatalogPhoto } from "../../utils/catalogImages";

export function ProductImage({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const fallback = categoryPhoto(`${product.name} ${product.category.name} ${product.category.slug}`);
  const source = product.images.find((url) => isCatalogPhoto(url) && !failedSources.includes(url));

  return (
    <img
      alt={source ? product.name : `${product.category.name} category photo`}
      className={className}
      loading="lazy"
      onError={source ? () => setFailedSources((current) => [...current, source]) : undefined}
      src={source || fallback}
    />
  );
}
