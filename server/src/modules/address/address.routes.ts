import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "./address.controller.js";
export const addressRouter = Router();
addressRouter.use(requireAuth);
addressRouter.route("/").get(listAddresses).post(createAddress);
addressRouter.route("/:id").patch(updateAddress).delete(deleteAddress);
addressRouter.patch("/:id/default", setDefaultAddress);
