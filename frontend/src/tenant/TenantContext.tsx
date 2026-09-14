import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Tenant } from "./tenant.types";
import { listCollectivites } from "@/api/collectivites.api";
import { useAuth } from "@/auth/AuthContext";
import { useEffect } from "react";

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  /*
    Temporairement, nous utilisons des données statiques.
    Plus tard :
    Keycloak
       ↓
    Spring Boot
       ↓
    API /tenants
       ↓
    TenantProvider
   */
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const {
    isAuthenticated,
    isLoading,
    collectiviteId,
    collectiviteNom,
    collectiviteLogoUrl,
    collectiviteCouleurPrincipale,
    collectiviteCouleurAccent,
    role,
  } = useAuth();

  // Transforme le modèle backend en modèle utilisé par le sélecteur de CTD.
  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setTenants([]);
      setCurrentTenantState(null);
      return;
    }

    if (role !== "SUPER_ADMINISTRATEUR") {
      const tenant = collectiviteId && collectiviteNom
        ? {
            id: collectiviteId,
            code: collectiviteId.slice(0, 8).toUpperCase(),
            name: collectiviteNom,
            type: "",
            logo: collectiviteLogoUrl,
            primaryColor: collectiviteCouleurPrincipale,
            accentColor: collectiviteCouleurAccent,
            active: true,
          }
        : null;
      setTenants(tenant ? [tenant] : []);
      setCurrentTenantState(tenant);
      return;
    }

    void listCollectivites().then((items) => {
      const mapped = items.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.nom,
        type: item.type,
        region: item.region,
        department: item.departement,
        logo: item.logoUrl,
        primaryColor: item.couleurPrincipale,
        accentColor: item.couleurAccent,
        active: item.statut !== "ARCHIVEE",
      }));
      const accessible = role === "SUPER_ADMINISTRATEUR"
        ? mapped
        : mapped.filter((tenant) => tenant.id === collectiviteId);
      setTenants(accessible);
      setCurrentTenantState((current) => accessible.find((tenant) => tenant.id === current?.id) ?? accessible[0] ?? null);
    }).catch(() => setTenants([]));
  }, [collectiviteCouleurAccent, collectiviteCouleurPrincipale, collectiviteId, collectiviteLogoUrl, collectiviteNom, isAuthenticated, isLoading, role]);

  const setCurrentTenant = (tenant: Tenant) => {
    setCurrentTenantState(tenant);
  };

  const value = useMemo(
    () => ({
      tenants,
      currentTenant,
      setCurrentTenant,
    }),
    [currentTenant, tenants],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant doit être utilisé dans un TenantProvider");
  }

  return context;
}
