import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { addressService } from "./address.service.js";
import {
  addressInputSchema,
  updateAddressSchema,
} from "./address.validation.js";
const uid = (request: Parameters<RequestHandler>[0]) => request.authUser!._id;
export const listAddresses: RequestHandler = async (req, res) =>
  res.json({ success: true, data: await addressService.list(uid(req)) });
export const createAddress: RequestHandler = async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      data: await addressService.create(
        uid(req),
        addressInputSchema.parse(req.body),
      ),
      message: "Address created",
    });
export const updateAddress: RequestHandler = async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  res.json({
    success: true,
    data: await addressService.update(
      uid(req),
      id,
      updateAddressSchema.parse(req.body),
    ),
    message: "Address updated",
  });
};
export const deleteAddress: RequestHandler = async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  await addressService.remove(uid(req), id);
  res.json({ success: true, message: "Address deleted" });
};
export const setDefaultAddress: RequestHandler = async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  res.json({
    success: true,
    data: await addressService.setDefault(uid(req), id),
    message: "Default address updated",
  });
};
