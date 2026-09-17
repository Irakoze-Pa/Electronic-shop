import { Router } from "express";
import { brandRouter } from "../modules/brand/brand.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { categoryRouter } from "../modules/category/category.routes.js";
import { productRouter } from "../modules/product/product.routes.js";
import { uploadRouter } from "../modules/upload/upload.routes.js";
import { healthRouter } from "./health.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import { cartRouter } from "../modules/cart/cart.routes.js";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes.js";
import { addressRouter } from "../modules/address/address.routes.js";
import {
  orderRouter,
  adminOrderRouter,
} from "../modules/order/order.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { purchaseOrderRouter } from "../modules/purchase-order/purchase-order.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/brands", brandRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin/orders", adminOrderRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/admin/purchase-orders", purchaseOrderRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/inventory-transactions", inventoryRouter);
