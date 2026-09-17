import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { Address } from "./address.model.js";
import type { z } from "zod";
import type { addressInputSchema } from "./address.validation.js";

type AddressInput = z.infer<typeof addressInputSchema>;
async function makeDefault(
  userId: string,
  addressId: string,
  session?: mongoose.ClientSession,
) {
  await Address.updateMany(
    { user: userId, _id: { $ne: addressId } },
    { $set: { isDefault: false } },
    { session },
  );
}
export const addressService = {
  list: (userId: string) =>
    Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }),
  async create(userId: string, input: AddressInput) {
    const session = await mongoose.startSession();
    let address;
    try {
      await session.withTransaction(async () => {
        const count = await Address.countDocuments({ user: userId }).session(
          session,
        );
        const [createdAddress] = await Address.create(
          [
            {
              ...input,
              user: userId,
              isDefault: input.isDefault || count === 0,
            },
          ],
          { session },
        );
        if (!createdAddress)
          throw new AppError("Could not create address", 500);
        address = createdAddress;
        if (createdAddress.isDefault)
          await makeDefault(userId, createdAddress.id, session);
      });
    } finally {
      await session.endSession();
    }
    return address;
  },
  async update(userId: string, id: string, input: Partial<AddressInput>) {
    const session = await mongoose.startSession();
    let address;
    try {
      await session.withTransaction(async () => {
        address = await Address.findOneAndUpdate(
          { _id: id, user: userId },
          input,
          { returnDocument: "after", runValidators: true, session },
        );
        if (!address) throw new AppError("Address not found", 404);
        if (input.isDefault) await makeDefault(userId, id, session);
      });
    } finally {
      await session.endSession();
    }
    return address;
  },
  async remove(userId: string, id: string) {
    const address = await Address.findOneAndDelete({ _id: id, user: userId });
    if (!address) throw new AppError("Address not found", 404);
  },
  async setDefault(userId: string, id: string) {
    return this.update(userId, id, { isDefault: true });
  },
};
