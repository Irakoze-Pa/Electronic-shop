import { Route, Routes, useLocation } from "react-router-dom";
import { StorefrontLayout } from "./layouts/StorefrontLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { SupportPolicyPage } from "./pages/SupportPolicyPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { ShopPage } from "./pages/ShopPage";
import { AdminBrandsPage } from "./pages/admin/AdminBrandsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { RequireAdmin, RequireAuth } from "./auth/ProtectedRoute";
import { AccountPage } from "./pages/AccountPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CartPage } from "./pages/CartPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AddressesPage } from "./pages/AddressesPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminOrderDetailsPage } from "./pages/admin/AdminOrderDetailsPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminInventoryPage } from "./pages/admin/AdminInventoryPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminCustomerDetailsPage } from "./pages/admin/AdminCustomerDetailsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminInventoryOverviewPage } from "./pages/admin/AdminInventoryOverviewPage";
import { AdminReceiveStockPage } from "./pages/admin/AdminReceiveStockPage";
import { AdminPurchaseOrdersPage } from "./pages/admin/AdminPurchaseOrdersPage";
import { AdminPurchaseOrderDetailsPage } from "./pages/admin/AdminPurchaseOrderDetailsPage";
import { AdminGoodsReceiptPage } from "./pages/admin/AdminGoodsReceiptPage";
import { AdminGoodsReceiptsRegisterPage } from "./pages/admin/AdminGoodsReceiptsRegisterPage";
import { AdminPointOfSalePage } from "./pages/admin/AdminPointOfSalePage";

export default function App() {
  const location = useLocation();
  const isAuth = location.pathname === "/login" || location.pathname === "/register";
  const background = (location.state as { backgroundLocation?: import("react-router-dom").Location } | null)?.backgroundLocation;
  return (
    <>
    <Routes location={isAuth ? background || "/" : location}>
      <Route element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories/:slug" element={<ShopPage />} />
        <Route path="delivery" element={<SupportPolicyPage topic="delivery" />} />
        <Route path="returns" element={<SupportPolicyPage topic="returns" />} />
        <Route path="warranty" element={<SupportPolicyPage topic="warranty" />} />
        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success/:id" element={<OrderSuccessPage />} />
          <Route path="account/addresses" element={<AddressesPage />} />
          <Route path="account/orders" element={<OrdersPage />} />
          <Route path="account/orders/:id" element={<OrderDetailsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
          <Route path="pos" element={<AdminPointOfSalePage />} />
          <Route path="inventory" element={<AdminInventoryOverviewPage />} />
          <Route path="inventory/purchase-orders" element={<AdminPurchaseOrdersPage />} />
          <Route path="inventory/purchase-orders/:id" element={<AdminPurchaseOrderDetailsPage />} />
          <Route path="inventory/purchase-orders/:id/receive" element={<AdminReceiveStockPage />} />
          <Route path="inventory/receipts/:id" element={<AdminGoodsReceiptPage />} />
          <Route path="inventory/receipts" element={<AdminGoodsReceiptsRegisterPage />} />
          <Route path="inventory/movements" element={<AdminInventoryPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="customers/:id" element={<AdminCustomerDetailsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Route>
    </Routes>
    {isAuth && <Routes><Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /></Routes>}
    </>
  );
}
