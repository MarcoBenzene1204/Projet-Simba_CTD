import React from "react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { Shell } from "lucide-react";

import { NavUser } from "@/components/admin/nav-user";
import { NavigationByRole, type role } from "@/lib/nav";
import { useAuthorization } from "@/auth/useAuthorization";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: role;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function AppSidebar({ role, user, ...props }: AppSidebarProps) {
  const location = useLocation();
  const { hasPermission } = useAuthorization();
  const menuGroups = (NavigationByRole[role] ?? NavigationByRole.ADMINISTRATEUR)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-sidebar-border/60 bg-sidebar/95">
      <SidebarHeader className="flex w-full items-center justify-center px-3 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-14 rounded-xl bg-primary px-3 text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90">
              <span className="flex items-center gap-3 text-base font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Shell className="h-4 w-4" /></span>
                <span className="block leading-none uppercase tracking-wider">Simba_CTD</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-3 py-2">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-1">
              <SidebarMenu className="w-full">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = item.url === "/dashboard"
                    ? location.pathname === item.url
                    : location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);

                  if (item.comingSoon) {
                    return (
                      <SidebarMenuItem
                        key={item.url}
                        className="flex w-full items-center gap-2"
                      >
                        <SidebarMenuButton
                          tooltip={`${item.titre} - Bientôt Disponible`}
                          className="pointer-events-none flex min-w-8 w-full items-center justify-start gap-3 rounded-lg opacity-50"
                        >
                          <IconComponent className={item.iconClass} />
                          <span className="text-sm font-medium">
                            {item.titre}
                          </span>
                          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                            Bientôt
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.url} className="w-full">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.titre}
                        //asChild
                        className="flex h-10 w-full items-center justify-start gap-3 rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:font-semibold data-[active=true]:text-primary"
                      >
                        <Link
                          to={item.url}
                          className="flex items-center justify-start gap-3"
                        >
                          <IconComponent className={item.iconClass} />
                          <span className="text-sm font-medium">
                            {item.titre}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
          <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
