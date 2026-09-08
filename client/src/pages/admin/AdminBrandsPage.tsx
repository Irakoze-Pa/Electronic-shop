import { createBrand, deleteBrand, listBrands, updateBrand } from "../../api/catalog";
import { CatalogEntityManager, type EntityInput } from "../../components/admin/CatalogEntityManager";

const load = async () => (await listBrands()).map((item) => ({ ...item, media: item.logo }));
const create = (input: EntityInput) => createBrand({ name: input.name, description: input.description, logo: input.media, status: input.status });
const update = (id: string, input: EntityInput) => updateBrand(id, { name: input.name, description: input.description, logo: input.media, status: input.status });
export function AdminBrandsPage() { return <CatalogEntityManager create={create} load={load} noun="brand" remove={deleteBrand} update={update} />; }
