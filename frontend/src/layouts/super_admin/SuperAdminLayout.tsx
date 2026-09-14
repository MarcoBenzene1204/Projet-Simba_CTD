import AppSidebar from "@/components/admin/app-sidebar";
import { SiteHeader } from "@/components/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { data } from "@/lib/CurrentUser";
import { TenantSwitcher } from "@/tenant/TenantSwitcher";
import { useAuth } from "@/auth/AuthContext";
import type { role } from "@/lib/nav";
import { ArisChatWidget } from "@/components/ai/ArisChatWidget";

export default function AdminLayout() {
  const { isAuthenticated, username, email, roles } = useAuth();

  console.log("Authenticated :", isAuthenticated);
  console.log("Username :", username);
  console.log("Email :", email);
  console.log("Roles :", roles);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar role={data.role as role} user={data} variant="inset">
        <div className="p-2">
          <TenantSwitcher />
        </div>
      </AppSidebar>

      <SidebarInset>
        <SiteHeader />

        <div className="m-5">
          <Outlet />
        </div>

        <ArisChatWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}
