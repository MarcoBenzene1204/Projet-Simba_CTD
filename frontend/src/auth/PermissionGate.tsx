import type { ReactNode } from "react";
import { useAuthorization } from "./useAuthorization";

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useAuthorization();
  return hasPermission(permission) ? children : fallback;
}