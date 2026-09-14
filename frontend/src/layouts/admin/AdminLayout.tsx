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
  // const currentRole = role as role | undefined;
  const user = {
    name: username ?? "Utilisateur SIMBA",
    email: email ?? "",
    role: role ?? "ADMINISTRATEUR",
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

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

        <ArisChatWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}
