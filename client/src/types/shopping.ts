import type { Product } from "./catalog";

export type ShoppingProduct = Pick<
  Product,
  | "_id"
  | "name"
  | "slug"
  | "images"
  | "price"
  | "oldPrice"
  | "stock"
  | "unit"
  | "brand"
  | "category"
  | "status"
> &
  Partial<Pick<Product, "code" | "shortDescription">>;

export interface CartItem {
  product: ShoppingProduct;
  quantity: number;
  lineSubtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
}

export interface Wishlist {
  products: ShoppingProduct[];
}
