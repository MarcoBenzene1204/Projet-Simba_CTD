import AppSidebar from "@/components/admin/app-sidebar";
import { SiteHeader } from "@/components/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { TenantSwitcher } from "@/tenant/TenantSwitcher";
import { useAuth } from "@/auth/AuthContext";
import type { role } from "@/lib/nav";
import { ArisChatWidget } from "@/components/ai/ArisChatWidget";

export default function AdminLayout() {
  const { username, email, role } = useAuth();
  const user = {
    name: username ?? "Super-administrateur SIMBA",
    email: email ?? "",
    role: role ?? "SUPER_ADMINISTRATEUR",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar role={user.role as role} user={user} variant="inset">
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
