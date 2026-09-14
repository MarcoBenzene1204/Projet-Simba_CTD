package com.marco.Simba_CTD.config;

import java.util.UUID;

/*
  Contexte de la collectivité courante.
 
  ThreadLocal permet de conserver le tenant pendant
  toute la durée d'une requête HTTP.
*/
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }
    //  Définit la collectivité courante.
    public static void setTenant(UUID tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /*
      Retourne la collectivité courante.
     
      Retourne null pour un SUPER_ADMINISTRATEUR
      ou lorsqu'aucun tenant n'a été défini.
     */
    public static UUID getTenant() {

        return CURRENT_TENANT.get();
    }

    // Vérifie si un tenant existe.
    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }

    /*
       Retourne obligatoirement le tenant.
      
       À utiliser dans les opérations qui ne peuvent
       fonctionner qu'à l'intérieur d'une CTD.
     */
    public static UUID requireTenant() {

        UUID tenantId = CURRENT_TENANT.get();

        if (tenantId == null) {

            throw new IllegalStateException(
                    "Aucune collectivité n'est associée "
                            + "à la requête courante.");
        }

        return tenantId;
    }

    /**
     * Nettoyage obligatoire du ThreadLocal.
     */
    public static void clear() {

        CURRENT_TENANT.remove();
    }
}