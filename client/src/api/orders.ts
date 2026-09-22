import { http } from "./http";
import type { ApiResponse } from "../types/catalog";
import type {
  CheckoutSummary,
  Order,
  OrderStatus,
  Pagination,
  PaymentMethod,
  PaymentStatus,
} from "../types/orders";
export async function getCheckoutSummary() {
  const { data } = await http.get<ApiResponse<CheckoutSummary>>(
    "/orders/checkout-summary",
  );
  return data.data;
}
export async function createOrder(input: {
  addressId: string;
  paymentMethod: PaymentMethod;
  customerNote: string;
}) {
  const { data } = await http.post<ApiResponse<Order>>("/orders", input);
  return data.data;
}
export async function listMyOrders() {
  const { data } = await http.get<ApiResponse<Order[]>>("/orders/my");
  return data.data;
}
export async function getMyOrder(id: string) {
  const { data } = await http.get<ApiResponse<Order>>(`/orders/my/${id}`);
  return data.data;
}
export async function cancelMyOrder(id: string) {
  const { data } = await http.post<ApiResponse<Order>>(
    `/orders/my/${id}/cancel`,
  );
  return data.data;
}
export async function listAdminOrders(params: {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  page?: number;
  from?: string;
  to?: string;
  sort?: string;
  salesChannel?: string;
}) {
  const { data } = await http.get<
    ApiResponse<Order[]> & { pagination: Pagination; totals: { orderValue: number; deliveredRevenue: number } }
  >("/admin/orders", { params });
  return data;
}
export async function createPhysicalSale(input: {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: "Cash" | "MobileMoney" | "Card" | "BankTransfer";
  amountPaid: number;
  discount: number;
  note: string;
  items: Array<{ product: string; quantity: number }>;
}) {
  const { data } = await http.post<ApiResponse<Order>>("/admin/orders/pos", input);
  return data.data;
}
export async function getAdminOrder(id: string) {
  const { data } = await http.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  return data.data;
}
export async function updateAdminOrderStatus(
  id: string,
  status: OrderStatus,
  adminNote?: string,
) {
  const { data } = await http.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/status`,
    { status, adminNote },
  );
  return data.data;
}
export async function updateAdminPaymentStatus(
  id: string,
  status: PaymentStatus,
) {
  const { data } = await http.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/payment-status`,
    { status },
  );
  return data.data;
}
