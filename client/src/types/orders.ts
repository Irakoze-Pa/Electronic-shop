import type { CartItem } from "./shopping";
export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  sector: string;
  addressLine: string;
  landmark: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
export type AddressInput = Omit<Address, "_id" | "createdAt" | "updatedAt">;
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Ready"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type PaymentMethod = "CashOnDelivery" | "BankTransfer" | "Cash" | "MobileMoney" | "Card";
export type SalesChannel = "Online" | "PhysicalShop";
export interface OrderItem {
  product: string;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface StatusHistory {
  status: OrderStatus;
  changedBy: string;
  note: string;
  changedAt: string;
}
export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salesChannel: SalesChannel;
  cashier?: string;
  shippingAddress: Omit<
    Address,
    "_id" | "isDefault" | "createdAt" | "updatedAt"
  >;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeReturned: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerNote: string;
  adminNote?: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}
export interface CheckoutSummary {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
