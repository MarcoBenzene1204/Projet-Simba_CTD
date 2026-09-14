package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.LigneMandat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LigneMandatRepository
        extends JpaRepository<LigneMandat, LigneMandat.LigneMandatId> {

    /**
     * Vérifie si une liquidation est déjà
     * rattachée à un mandat.
     */
    boolean existsByLiquidationId(
            UUID liquidationId);

    /**
     * Version tenant-aware.
     */
    @Query("""
                SELECT COUNT(l) > 0
                FROM LigneMandat l
                WHERE l.liquidation.id = :liquidationId
                  AND l.mandat.collectiviteId = :collectiviteId
            """)
    boolean existsByLiquidationIdAndCollectiviteId(
            @Param("liquidationId") UUID liquidationId,

            @Param("collectiviteId") UUID collectiviteId);

    /**
     * Toutes les lignes d'un mandat appartenant
     * à une collectivité donnée.
     */
    @Query("""
                SELECT l
                FROM LigneMandat l
                WHERE l.mandat.id = :mandatId
                  AND l.mandat.collectiviteId = :collectiviteId
            """)
    List<LigneMandat> findByMandatIdAndCollectiviteId(
            @Param("mandatId") UUID mandatId,

            @Param("collectiviteId") UUID collectiviteId);
}