import { Product } from "../product/product.model.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { Category } from "./category.model.js";
import type { CategoryInput } from "./category.types.js";

export const categoryService = {
  list: () => Category.find().sort({ name: 1 }),
  async get(id: string) {
    const category = await Category.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },
  async create(input: CategoryInput) {
    const slug = slugify(input.name);
    if (await Category.exists({ $or: [{ slug }, { name: input.name }] })) throw new AppError("Category name or slug already exists", 409);
    return Category.create({ ...input, slug });
  },
  async update(id: string, input: Partial<CategoryInput>) {
    const slug = input.name ? slugify(input.name) : undefined;
    if (slug && (await Category.exists({ slug, _id: { $ne: id } }))) throw new AppError("Category slug already exists", 409);
    const category = await Category.findByIdAndUpdate(id, { ...input, ...(slug ? { slug } : {}) }, { returnDocument: "after", runValidators: true });
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },
  async remove(id: string) {
    if (await Product.exists({ category: id })) throw new AppError("Category is assigned to products", 409);
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError("Category not found", 404);
  },
};
