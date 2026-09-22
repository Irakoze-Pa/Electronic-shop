export const orderStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const paymentStatuses = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];
export const paymentMethods = [
  "CashOnDelivery",
  "BankTransfer",
  "Cash",
  "MobileMoney",
  "Card",
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export const salesChannels = ["Online", "PhysicalShop"] as const;
export type SalesChannel = (typeof salesChannels)[number];
export const orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Ready", "Cancelled"],
  Ready: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
