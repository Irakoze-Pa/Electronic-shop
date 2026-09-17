import mongoose, { Types, type QueryFilter, type SortOrder } from "mongoose";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { Address } from "../address/address.model.js";
import { Cart } from "../cart/cart.model.js";
import { Product } from "../product/product.model.js";
import { User } from "../user/user.model.js";
import { Order, OrderCounter } from "./order.model.js";
import { cartService } from "../cart/cart.service.js";
import { InventoryTransaction } from "../../models/inventory-transaction.model.js";
import {
  orderTransitions,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "./order.types.js";

async function nextOrderNumber(session: mongoose.ClientSession) {
  const counter = await OrderCounter.findByIdAndUpdate(
    "orders",
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: "after", session },
  );
  if (!counter) throw new AppError("Could not generate order number", 500);
  return `ORD-${new Date().getUTCFullYear()}-${String(counter.sequence).padStart(6, "0")}`;
}
function orderIdFilter(id: string) {
  return Types.ObjectId.isValid(id)
    ? { _id: id }
    : { orderNumber: id.toUpperCase() };
}
function customerOrder(order: InstanceType<typeof Order>) {
  const value = order.toObject();
  Reflect.deleteProperty(value, "adminNote");
  Reflect.deleteProperty(value, "inventoryRestored");
  return value;
}
async function restoreInventory(
  order: InstanceType<typeof Order>,
  session: mongoose.ClientSession,
) {
  if (order.inventoryRestored) return;
  for (const item of order.items)
    {
    const product = await Product.findOneAndUpdate(
      { _id: item.product },
      { $inc: { stock: item.quantity } },
      { session, returnDocument: "before" },
    );
    if (product) await InventoryTransaction.create([{
      product: item.product, type: "Increase", quantity: item.quantity,
      previousStock: product.stock, newStock: product.stock + item.quantity,
      reason: "Order cancelled", note: order.orderNumber,
      createdBy: order.user, order: order._id,
    }], { session });
    }
  order.inventoryRestored = true;
}
async function transition(
  order: InstanceType<typeof Order>,
  status: OrderStatus,
  actorId: string,
  session: mongoose.ClientSession,
  note = "",
) {
  if (order.orderStatus === status) return order;
  if (!orderTransitions[order.orderStatus].includes(status))
    throw new AppError(
      `Order cannot move from ${order.orderStatus} to ${status}`,
      400,
    );
  if (status === "Cancelled") await restoreInventory(order, session);
  order.orderStatus = status;
  order.statusHistory.push({
    status,
    changedBy: new Types.ObjectId(actorId),
    note,
    changedAt: new Date(),
  });
  await order.save({ session });
  return order;
}
export const orderService = {
  async checkoutSummary(userId: string) {
    const cart = await cartService.get(userId);
    return {
      ...cart,
      shippingFee: env.SHIPPING_FEE,
      discount: 0,
      total: cart.subtotal + env.SHIPPING_FEE,
    };
  },
  async create(
    userId: string,
    input: {
      addressId: string;
      paymentMethod: PaymentMethod;
      customerNote: string;
    },
  ) {
    const session = await mongoose.startSession();
    let created;
    try {
      await session.withTransaction(async () => {
        // MongoDB transactions do not support parallel operations on one session.
        const user = await User.findById(userId).session(session);
        const address = await Address.findOne({
          _id: input.addressId,
          user: userId,
        }).session(session);
        const cart = await Cart.findOne({ user: userId }).session(session);
        if (!user) throw new AppError("Customer not found", 404);
        if (!address) throw new AppError("Delivery address not found", 404);
        if (!cart?.items.length) throw new AppError("Your cart is empty", 400);
        const items = [];
        const stockTransactions: Array<{ product: Types.ObjectId; quantity: number; previousStock: number }> = [];
        let subtotal = 0;
        for (const cartItem of cart.items) {
          const product = await Product.findOneAndUpdate(
            {
              _id: cartItem.product,
              status: "Active",
              stock: { $gte: cartItem.quantity },
            },
            { $inc: { stock: -cartItem.quantity } },
            { returnDocument: "before", session },
          );
          if (!product)
            throw new AppError(
              "A cart item is unavailable or has insufficient stock. Please refresh your cart.",
              400,
            );
          const lineSubtotal = product.price * cartItem.quantity;
          subtotal += lineSubtotal;
          items.push({
            product: product._id,
            productName: product.name,
            sku: product.code,
            image: product.images[0] ?? "",
            quantity: cartItem.quantity,
            unitPrice: product.price,
            subtotal: lineSubtotal,
          });
          stockTransactions.push({ product: product._id, quantity: cartItem.quantity, previousStock: product.stock });
        }
        const shippingFee = env.SHIPPING_FEE;
        const discount = 0;
        const total = subtotal + shippingFee - discount;
        const orderNumber = await nextOrderNumber(session);
        [created] = await Order.create(
          [
            {
              orderNumber,
              user: userId,
              customerName: `${user.firstName} ${user.lastName}`,
              customerEmail: user.email,
              customerPhone: user.phone,
              shippingAddress: {
                fullName: address.fullName,
                phone: address.phone,
                country: address.country,
                city: address.city,
                district: address.district,
                sector: address.sector,
                addressLine: address.addressLine,
                landmark: address.landmark,
                postalCode: address.postalCode,
              },
              items,
              subtotal,
              shippingFee,
              discount,
              total,
              paymentMethod: input.paymentMethod,
              paymentStatus: "Pending",
              orderStatus: "Pending",
              customerNote: input.customerNote,
              statusHistory: [
                {
                  status: "Pending",
                  changedBy: userId,
                  note: "Order placed",
                  changedAt: new Date(),
                },
              ],
            },
          ],
          { session },
        );
        await InventoryTransaction.insertMany(stockTransactions.map((stock) => ({
          product: stock.product, type: "Decrease", quantity: stock.quantity,
          previousStock: stock.previousStock, newStock: stock.previousStock - stock.quantity,
          reason: "Order placed", note: created!.orderNumber,
          createdBy: userId, order: created!._id,
        })), { session });
        await Cart.updateOne(
          { _id: cart._id },
          { $set: { items: [] } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    if (!created) throw new AppError("Order could not be created", 500);
    return customerOrder(created);
  },
  listMine(userId: string) {
    return Order.find({ user: userId }).sort({ createdAt: -1 });
  },
  async getMine(userId: string, id: string) {
    const order = await Order.findOne({ ...orderIdFilter(id), user: userId });
    if (!order) throw new AppError("Order not found", 404);
    return order;
  },
  async cancelMine(userId: string, id: string) {
    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        const order = await Order.findOne({
          ...orderIdFilter(id),
          user: userId,
        })
          .select("+inventoryRestored")
          .session(session);
        if (!order) throw new AppError("Order not found", 404);
        if (order.orderStatus === "Cancelled") {
          result = order;
          return;
        }
        if (order.orderStatus !== "Pending")
          throw new AppError(
            "This order can no longer be cancelled by the customer",
            400,
          );
        result = await transition(
          order,
          "Cancelled",
          userId,
          session,
          "Cancelled by customer",
        );
      });
    } finally {
      await session.endSession();
    }
    return result ? customerOrder(result) : result;
  },
  async listAdmin(query: {
    search?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
    sort: "newest" | "oldest" | "total-asc" | "total-desc";
  }) {
    const filter: QueryFilter<unknown> = {};
    if (query.search) {
      const search = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }
    if (query.orderStatus) filter.orderStatus = query.orderStatus;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.from || query.to) filter.createdAt = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: new Date(new Date(query.to).setHours(23, 59, 59, 999)) } : {}),
    };
    const sorts: Record<typeof query.sort, Record<string, SortOrder>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "total-asc": { total: 1 },
      "total-desc": { total: -1 },
    };
    const [items, total, totals] = await Promise.all([
      Order.find(filter)
        .sort(sorts[query.sort])
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      Order.countDocuments(filter),
      Order.aggregate([{ $match: filter }, { $group: { _id: null, orderValue: { $sum: "$total" }, deliveredRevenue: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, "$total", 0] } } } }]),
    ]);
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
      totals: totals[0] ?? { orderValue: 0, deliveredRevenue: 0 },
    };
  },
  async getAdmin(id: string) {
    const order = await Order.findOne(orderIdFilter(id)).select("+adminNote");
    if (!order) throw new AppError("Order not found", 404);
    return order;
  },
  async updateStatus(
    id: string,
    status: OrderStatus,
    actorId: string,
    adminNote = "",
  ) {
    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        const order = await Order.findOne(orderIdFilter(id))
          .select("+adminNote +inventoryRestored")
          .session(session);
        if (!order) throw new AppError("Order not found", 404);
        result = await transition(order, status, actorId, session, adminNote);
        if (adminNote) order.adminNote = adminNote;
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
    return result;
  },
  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const order = await Order.findOneAndUpdate(
      orderIdFilter(id),
      { paymentStatus: status },
      { returnDocument: "after", runValidators: true },
    ).select("+adminNote");
    if (!order) throw new AppError("Order not found", 404);
    return order;
  },
};
