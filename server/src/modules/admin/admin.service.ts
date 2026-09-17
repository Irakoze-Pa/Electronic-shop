import { Types } from "mongoose";
import { Address } from "../address/address.model.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";
import { User } from "../user/user.model.js";
import type { UserStatus } from "../user/user.types.js";
import { AppError } from "../../utils/AppError.js";

export const revenueStatuses = ["Delivered"] as const;
function dateRange(period: string, from?: Date, to?: Date) {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  const start = from ? new Date(from) : new Date(end);
  if (!from) {
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "7d") start.setDate(start.getDate() - 6);
    else if (period === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else start.setDate(start.getDate() - 29);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export const adminService = {
  async dashboard() {
    const [productStats, customers, orderStats, recentOrders, statusSummary, salesTrend, topProducts, lowStockProducts, recentCustomers] = await Promise.all([
      Product.aggregate([{ $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } }, lowStock: { $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$lowStockThreshold"] }] }, 1, 0] } }, outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } } } }]),
      User.countDocuments({ role: "Customer" }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "Pending"] }, 1, 0] } }, delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } }, sales: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, "$total", 0] } } } }]),
      Order.find().sort({ createdAt: -1 }).limit(6).select("orderNumber customerName total orderStatus createdAt"),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Order.aggregate([{ $match: { orderStatus: "Delivered", createdAt: { $gte: new Date(Date.now() - 29 * 86400000) } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, sales: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $match: { orderStatus: { $ne: "Cancelled" } } }, { $unwind: "$items" }, { $group: { _id: "$items.product", name: { $first: "$items.productName" }, sku: { $first: "$items.sku" }, quantity: { $sum: "$items.quantity" }, sales: { $sum: "$items.subtotal" } } }, { $sort: { quantity: -1 } }, { $limit: 5 }]),
      Product.find({ stock: { $gt: 0 }, $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).sort({ stock: 1 }).limit(6).select("name code stock lowStockThreshold unit"),
      User.find({ role: "Customer" }).sort({ createdAt: -1 }).limit(6).select("firstName lastName email phone status createdAt"),
    ]);
    const products = productStats[0] ?? { total: 0, active: 0, lowStock: 0, outOfStock: 0 };
    const orders = orderStats[0] ?? { total: 0, pending: 0, delivered: 0, sales: 0 };
    return { metrics: { totalProducts: products.total, activeProducts: products.active, lowStockProducts: products.lowStock, outOfStockProducts: products.outOfStock, totalCustomers: customers, totalOrders: orders.total, pendingOrders: orders.pending, deliveredOrders: orders.delivered, totalSalesValue: orders.sales }, recentOrders, orderStatusSummary: statusSummary.map((x) => ({ status: x._id, count: x.count })), salesTrend: salesTrend.map((x) => ({ date: x._id, sales: x.sales, orders: x.orders })), topSellingProducts: topProducts, lowStockProducts, recentCustomers, revenueStatuses };
  },
  async report(period: string, from?: Date, to?: Date) {
    const { start, end } = dateRange(period, from, to);
    if (start > end) throw new AppError("Start date must not be after end date", 400);
    const match = { createdAt: { $gte: start, $lte: end } };
    const [summary, topProducts, salesByPeriod] = await Promise.all([
      Order.aggregate([{ $match: match }, { $group: { _id: null, orders: { $sum: 1 }, grossOrderValue: { $sum: "$total" }, totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, "$total", 0] } }, deliveredOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } }, cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] } } } }]),
      Order.aggregate([{ $match: { ...match, orderStatus: "Delivered" } }, { $unwind: "$items" }, { $group: { _id: "$items.product", name: { $first: "$items.productName" }, sku: { $first: "$items.sku" }, quantity: { $sum: "$items.quantity" }, sales: { $sum: "$items.subtotal" } } }, { $sort: { sales: -1 } }, { $limit: 10 }]),
      Order.aggregate([{ $match: { ...match, orderStatus: "Delivered" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, sales: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);
    const s = summary[0] ?? { orders: 0, grossOrderValue: 0, totalSales: 0, deliveredOrders: 0, cancelledOrders: 0 };
    return { range: { from: start, to: end, period }, revenueStatuses, summary: { ...s, averageOrderValue: s.orders ? s.grossOrderValue / s.orders : 0, deliveredOrderRevenue: s.totalSales }, topProducts, salesByPeriod: salesByPeriod.map((x) => ({ date: x._id, sales: x.sales, orders: x.orders })) };
  },
  async customers(query: { search?: string; status?: UserStatus; page: number; limit: number }) {
    const match: Record<string, unknown> = { role: "Customer" };
    if (query.status) match.status = query.status;
    if (query.search) { const s = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); match.$or = [{ firstName: { $regex: s, $options: "i" } }, { lastName: { $regex: s, $options: "i" } }, { email: { $regex: s, $options: "i" } }, { phone: { $regex: s, $options: "i" } }]; }
    const pipeline = [{ $match: match }, { $lookup: { from: "orders", localField: "_id", foreignField: "user", as: "orders" } }, { $addFields: { totalOrders: { $size: "$orders" }, totalSpent: { $sum: { $map: { input: { $filter: { input: "$orders", as: "order", cond: { $eq: ["$$order.orderStatus", "Delivered"] } } }, as: "order", in: "$$order.total" } } } } }, { $project: { password: 0, orders: 0 } }, { $sort: { createdAt: -1 as const } }];
    const [items, total] = await Promise.all([User.aggregate([...pipeline, { $skip: (query.page - 1) * query.limit }, { $limit: query.limit }]), User.countDocuments(match)]);
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
  },
  async customer(id: string) {
    const objectId = new Types.ObjectId(id);
    const [customer, addresses, orders] = await Promise.all([User.findOne({ _id: objectId, role: "Customer" }).select("firstName lastName email phone status createdAt updatedAt"), Address.find({ user: objectId }).sort({ isDefault: -1 }), Order.find({ user: objectId }).sort({ createdAt: -1 })]);
    if (!customer) throw new AppError("Customer not found", 404);
    const delivered = orders.filter((order) => order.orderStatus === "Delivered");
    return { customer, addresses, orders, totals: { totalOrders: orders.length, totalSpent: delivered.reduce((sum, order) => sum + order.total, 0) }, revenueStatuses };
  },
  async updateCustomerStatus(id: string, status: UserStatus) {
    const customer = await User.findOneAndUpdate({ _id: id, role: "Customer" }, { status }, { returnDocument: "after", runValidators: true }).select("firstName lastName email phone status createdAt updatedAt");
    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
  },
};
