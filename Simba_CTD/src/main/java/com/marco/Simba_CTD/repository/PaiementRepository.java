package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaiementRepository
        extends JpaRepository<Paiement, UUID> {

    /**
     * Recherche sécurisée par ID + collectivité.
     */
    Optional<Paiement> findByIdAndCollectiviteId(
            UUID id,
            UUID collectiviteId);

    /**
     * Tous les paiements d'une collectivité.
     */
    List<Paiement> findByCollectiviteId(
            UUID collectiviteId);

    /**
     * Paiements d'un mandat.
     */
    List<Paiement> findByMandatIdAndCollectiviteId(
            UUID mandatId,
            UUID collectiviteId);

    /**
     * Vérifie si un mandat possède déjà un paiement.
     */
    boolean existsByMandatIdAndCollectiviteId(
            UUID mandatId,
            UUID collectiviteId);

    /**
     * Vérifie l'unicité du numéro de paiement.
     */
    boolean existsByNumeroPaiementAndCollectiviteId(
            String numeroPaiement,
            UUID collectiviteId);

    /**
     * Recherche les paiements selon leur statut.
     */
    List<Paiement> findByCollectiviteIdAndStatut(
            UUID collectiviteId,
            Paiement.StatutPaiement statut);
}