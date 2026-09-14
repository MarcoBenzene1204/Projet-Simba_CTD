import { ChevronsUpDown, Building2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTenant } from "@/tenant/TenantContext";

export function TenantSwitcher() {
  const { tenants, currentTenant, setCurrentTenant } = useTenant();

  if (!currentTenant) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="w-full justify-between px-2" />}
      >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium">
                {currentTenant.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {currentTenant.code}
              </p>
            </div>
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => setCurrentTenant(tenant)}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Building2 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{tenant.name}</p>

                <p className="text-xs text-muted-foreground">{tenant.code}</p>
              </div>
            </div>

            {currentTenant.id === tenant.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
