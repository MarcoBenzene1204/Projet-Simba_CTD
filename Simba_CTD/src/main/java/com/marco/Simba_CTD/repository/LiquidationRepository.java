package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.Liquidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LiquidationRepository
        extends JpaRepository<Liquidation, UUID> {

    /**
     * Toutes les liquidations d'un engagement.
     */
    List<Liquidation> findByEngagementId(
            UUID engagementId);

    /**
     * Liquidations d'un engagement ayant un état donné.
     */
    List<Liquidation> findByEngagementIdAndEtat(
            UUID engagementId,
            Liquidation.EtatLiquidation etat);

    /**
     * Recherche sécurisée par ID + collectivité.
     */
    Optional<Liquidation> findByIdAndCollectiviteId(
            UUID id,
            UUID collectiviteId);

    /**
     * Toutes les liquidations d'une collectivité.
     */
    List<Liquidation> findByCollectiviteId(
            UUID collectiviteId);

    /**
     * Liquidations d'un engagement dans une collectivité.
     */
    List<Liquidation> findByCollectiviteIdAndEngagementId(
            UUID collectiviteId,
            UUID engagementId);

    /**
     * Vérification d'un numéro de facture dans un tenant.
     */
    boolean existsByNumeroFactureAndCollectiviteId(
            String numeroFacture,
            UUID collectiviteId);

    /**
     * Vérification d'un numéro de liquidation dans un tenant.
     */
    boolean existsByNumeroAndCollectiviteId(
            String numero,
            UUID collectiviteId);

    /**
     * Récupération de plusieurs liquidations appartenant
     * obligatoirement au même tenant.
     */
    @Query("""
                SELECT l
                FROM Liquidation l
                WHERE l.collectiviteId = :collectiviteId
                  AND l.id IN :ids
            """)
    List<Liquidation> findAllByIdInAndCollectiviteId(
            @Param("ids") List<UUID> ids,

            @Param("collectiviteId") UUID collectiviteId);

    /**
     * Calcule le total des liquidations validées/prêtes
     * pour un engagement.
     */
    @Query("""
                SELECT COALESCE(SUM(l.montantTTC), 0)
                FROM Liquidation l
                WHERE l.collectiviteId = :collectiviteId
                  AND l.engagement.id = :engagementId
                  AND l.etat IN (
                      com.marco.Simba_CTD.entity.Liquidation$EtatLiquidation.VALIDEE_CF,
                      com.marco.Simba_CTD.entity.Liquidation$EtatLiquidation.PRETE_ORDONNANCEMENT
                  )
            """)
    BigDecimal calculerTotalLiquidationsValidees(
            @Param("collectiviteId") UUID collectiviteId,

            @Param("engagementId") UUID engagementId);

    /**
     * Recherche les liquidations prêtes pour
     * l'ordonnancement.
     */
    List<Liquidation> findByCollectiviteIdAndEtat(
            UUID collectiviteId,
            Liquidation.EtatLiquidation etat);
}