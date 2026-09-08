import { createCategory, deleteCategory, listCategories, updateCategory } from "../../api/catalog";
import { CatalogEntityManager, type EntityInput } from "../../components/admin/CatalogEntityManager";

const load = async () => (await listCategories()).map((item) => ({ ...item, media: item.image }));
const create = (input: EntityInput) => createCategory({ name: input.name, description: input.description, image: input.media, status: input.status });
const update = (id: string, input: EntityInput) => updateCategory(id, { name: input.name, description: input.description, image: input.media, status: input.status });
export function AdminCategoriesPage() { return <CatalogEntityManager create={create} load={load} noun="category" remove={deleteCategory} update={update} />; }
