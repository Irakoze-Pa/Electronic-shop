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

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/brands", brandRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/inventory-transactions", inventoryRouter);
