import { Router } from "express";
import { brandRouter } from "./brand.routes.js";
import { categoryRouter } from "./category.routes.js";
import { healthRouter } from "./health.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import { productRouter } from "./product.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/brands", brandRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/inventory-transactions", inventoryRouter);
