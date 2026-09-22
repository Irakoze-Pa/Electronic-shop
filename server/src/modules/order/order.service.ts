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
  const inventoryActor = order.cashier ?? order.user;
  if (!inventoryActor) throw new AppError("Order has no inventory audit owner", 500);
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
      createdBy: inventoryActor, order: order._id,
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
  async createPhysicalSale(actorId: string, input: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: "Cash" | "MobileMoney" | "Card" | "BankTransfer";
    amountPaid: number;
    discount: number;
    note: string;
    items: Array<{ product: string; quantity: number }>;
  }) {
    const session = await mongoose.startSession();
    let created;
    try {
      await session.withTransaction(async () => {
        const cashier = await User.findById(actorId).session(session);
        if (!cashier) throw new AppError("Cashier not found", 404);
        const customer = input.customerId
          ? await User.findOne({ _id: input.customerId, role: "Customer", status: "Active" }).session(session)
          : null;
        if (input.customerId && !customer) throw new AppError("Customer not found or inactive", 400);
        const items = [];
        const stockTransactions: Array<{ product: Types.ObjectId; quantity: number; previousStock: number }> = [];
        let subtotal = 0;
        for (const requested of input.items) {
          const product = await Product.findOneAndUpdate(
            { _id: requested.product, status: "Active", stock: { $gte: requested.quantity } },
            { $inc: { stock: -requested.quantity } },
            { returnDocument: "before", session },
          );
          if (!product) throw new AppError("A product is unavailable or has insufficient stock", 400);
          const lineSubtotal = product.price * requested.quantity;
          subtotal += lineSubtotal;
          items.push({ product: product._id, productName: product.name, sku: product.code, image: product.images[0] ?? "", quantity: requested.quantity, unitPrice: product.price, subtotal: lineSubtotal });
          stockTransactions.push({ product: product._id, quantity: requested.quantity, previousStock: product.stock });
        }
        if (input.discount > subtotal) throw new AppError("Discount cannot exceed the subtotal", 400);
        const total = subtotal - input.discount;
        if (input.amountPaid < total) throw new AppError("Amount paid cannot be less than the sale total", 400);
        const orderNumber = await nextOrderNumber(session);
        const name = customer ? `${customer.firstName} ${customer.lastName}` : input.customerName;
        [created] = await Order.create([{
          orderNumber,
          user: customer?._id ?? null,
          salesChannel: "PhysicalShop",
          cashier: actorId,
          customerName: name,
          customerEmail: customer?.email ?? "walk-in@physical.shop",
          customerPhone: customer?.phone || input.customerPhone,
          shippingAddress: { fullName: name, phone: customer?.phone || input.customerPhone, country: "", city: "", district: "", sector: "", addressLine: "Collected in store", landmark: "", postalCode: "" },
          items, subtotal, shippingFee: 0, discount: input.discount, total,
          paymentMethod: input.paymentMethod,
          amountPaid: input.amountPaid,
          changeReturned: input.amountPaid - total,
          paymentStatus: "Paid",
          orderStatus: "Delivered",
          customerNote: input.note,
          statusHistory: [{ status: "Delivered", changedBy: actorId, note: "Physical shop sale completed", changedAt: new Date() }],
        }], { session });
        await InventoryTransaction.insertMany(stockTransactions.map((stock) => ({
          product: stock.product, type: "Decrease", quantity: stock.quantity,
          previousStock: stock.previousStock, newStock: stock.previousStock - stock.quantity,
          reason: "Physical shop sale", note: created!.orderNumber,
          createdBy: actorId, order: created!._id,
        })), { session });
      });
    } finally { await session.endSession(); }
    if (!created) throw new AppError("Physical sale could not be created", 500);
    return created;
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
    salesChannel?: "Online" | "PhysicalShop";
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
    if (query.salesChannel) filter.salesChannel = query.salesChannel;
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
