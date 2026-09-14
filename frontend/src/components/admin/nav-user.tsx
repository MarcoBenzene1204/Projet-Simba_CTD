"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "react-router";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { getInitials } from "@/lib/CurrentUser";

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  UserCircle,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";

interface NavUserProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  const initial = getInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
            {/* ================================
              DÉCLENCHEUR
             ================================= */}
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={`Menu utilisateur de ${user.name}`}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>

            {/* ================================
              CONTENU
             ================================= */}
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Informations utilisateur */}
            <div className="flex items-center gap-2 p-2 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />

                <AvatarFallback
                  className="
                    rounded-lg
                    bg-primary/10
                    text-primary
                    font-semibold
                  "
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
                <span className="truncate text-xs font-medium text-primary">
                  {user.role}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* ================================
              ACTIONS
               ================================= */}
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/dashboard/profil" />} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Mon profil</span>
              </DropdownMenuItem>

              {/* <DropdownMenuItem render={<Link to="/dashboard/facturation" />} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Facturation</span>
              </DropdownMenuItem> */}

              <DropdownMenuItem render={<Link to="/dashboard/notifications" />} className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* ================================
                LOGOUT
               ================================= */}
            <DropdownMenuItem
              className="
                cursor-pointer
                text-destructive
                focus:bg-destructive/10
                focus:text-destructive
              "
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
