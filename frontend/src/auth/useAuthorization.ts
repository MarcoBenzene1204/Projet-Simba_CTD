import { useCallback } from "react";
import { useAuth } from "./AuthContext";
import type { RoleApplication } from "@/config/roleConfig";

export function useAuthorization() {
  const { role, permissions } = useAuth();

  const normalizedPermissions = permissions
    .map((permission) => permission.trim().toLowerCase())
    .map((permission) => permission.startsWith("role_") ? permission.slice(5) : permission);

  const hasPermission = useCallback(
    (permission: string) => normalizedPermissions.includes(permission.trim().toLowerCase()),
    [normalizedPermissions],
  );
  const hasRole = useCallback((expectedRole: RoleApplication) => role === expectedRole, [role]);
  const hasAnyRole = useCallback((expectedRoles: RoleApplication[]) =>
    role !== undefined && expectedRoles.includes(role), [role]);

  return { role, permissions, hasPermission, hasRole, hasAnyRole };
}