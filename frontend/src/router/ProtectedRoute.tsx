import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/AuthContext";
import type { RoleApplication } from "@/config/roleConfig";
import { LoaderPinwheel } from "lucide-react";
import { AccessDenied } from "@/components/auth/AccessDenied";

interface ProtectedRouteProps {
  allowedRoles?: RoleApplication[];
  allowedPermissions?: string[];
}

export default function ProtectedRoute({
  allowedRoles = [],
  allowedPermissions = [],
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role, permissions } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center space-x-2">
        <LoaderPinwheel className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium text-foreground">
          Chargement...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  // Aucun rôle = accès refusé.
  if (!role) {
    return <Navigate to="/connexion" replace />;
  }

  // Vérification des rôles autorisés.
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(role);

    if (!hasRole) {
      return <AccessDenied />;
    }
  }

  if (allowedPermissions.length > 0 && !allowedPermissions.some((permission) => permissions.includes(permission))) {
    return <AccessDenied />;
  }

  return <Outlet />;
}
