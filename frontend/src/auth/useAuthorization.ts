import { useCallback } from "react";
import { useAuth } from "./AuthContext";
import type { RoleApplication } from "@/config/roleConfig";

export function useAuthorization() {
  const { role, permissions } = useAuth();

  const hasPermission = useCallback((permission: string) => permissions.includes(permission), [permissions]);
  const hasRole = useCallback((expectedRole: RoleApplication) => role === expectedRole, [role]);
  const hasAnyRole = useCallback((expectedRoles: RoleApplication[]) =>
    role !== undefined && expectedRoles.includes(role), [role]);

  return { role, permissions, hasPermission, hasRole, hasAnyRole };
}