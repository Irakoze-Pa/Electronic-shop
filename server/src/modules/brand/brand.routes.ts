import { Router } from "express";
import { createBrand, deleteBrand, getBrand, listBrands, updateBrand } from "./brand.controller.js";

export const brandRouter = Router();
brandRouter.route("/").get(listBrands).post(createBrand);
brandRouter.route("/:id").get(getBrand).patch(updateBrand).delete(deleteBrand);
