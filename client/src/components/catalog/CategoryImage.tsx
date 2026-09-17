import { useState } from "react";
import type { Category } from "../../types/catalog";
import { categoryPhoto, isCatalogPhoto } from "../../utils/catalogImages";

export function CategoryImage({ category, className }: { category: Category; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = isCatalogPhoto(category.image) && category.image !== failedSource ? category.image : undefined;

  return (
    <img
      alt=""
      className={className}
      loading="lazy"
      onError={source ? () => setFailedSource(source) : undefined}
      src={source || categoryPhoto(`${category.name} ${category.slug}`)}
    />
  );
}
