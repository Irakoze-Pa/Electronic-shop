import { Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "./layouts/StorefrontLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { ShopPage } from "./pages/ShopPage";
import { AdminBrandsPage } from "./pages/admin/AdminBrandsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories/:slug" element={<ShopPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminProductsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
      </Route>
    </Routes>
  );
}
