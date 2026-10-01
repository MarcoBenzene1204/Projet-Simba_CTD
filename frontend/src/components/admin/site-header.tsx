import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronsRight } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";
import { NotificationBell } from "@/components/admin/NotificationBell";

export function SiteHeader() {
  const { roles } = useAuth();
  const { currentTenant } = useTenant();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center-safe gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 bg-secondary/50 text-primary" />
        <ChevronsRight
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-6 text-secondary"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{currentTenant?.name ?? "Simba CTD"}</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{roles[0] ?? "Profil"}</p>
        </div>
        <div className="ml-auto"><NotificationBell /></div>
      </div>
    </header>
  );
}
