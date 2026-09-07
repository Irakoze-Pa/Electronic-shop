import { Outlet } from "react-router-dom";
import { StorefrontFooter } from "../components/layout/StorefrontFooter";
import { StorefrontHeader } from "../components/layout/StorefrontHeader";

export function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <StorefrontFooter />
    </div>
  );
}
