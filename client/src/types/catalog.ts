export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}
