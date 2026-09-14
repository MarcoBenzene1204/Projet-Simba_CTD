package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.Engagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EngagementRepository
        extends JpaRepository<Engagement, UUID> {

    //   Engagements d'une collectivité.
    List<Engagement> findByCollectiviteId(UUID collectiviteId);

    //   Engagements d'un ordonnateur dans une collectivité.
    List<Engagement> findByOrdonnatorIdAndCollectiviteId(
            UUID ordonnatorId,
            UUID collectiviteId);

    //   Engagements ayant un état donné dans une collectivité.
    List<Engagement> findByEtatAndCollectiviteId(
            Engagement.EtatEngagement etat,
            UUID collectiviteId);

    //  Recherche sécurisée par ID + tenant.
    Optional<Engagement> findByIdAndCollectiviteId(
            UUID id,
            UUID collectiviteId);

     // Engagements liés à une ligne budgétaire.
    List<Engagement> findByLigneBudgetaireIdAndCollectiviteId(
            UUID ligneBudgetaireId,
            UUID collectiviteId);

     // Vérifie l'existence d'un numéro d'engagement dans une collectivité.
    boolean existsByNumeroEngagementAndCollectiviteId(
            String numeroEngagement,
            UUID collectiviteId);
}