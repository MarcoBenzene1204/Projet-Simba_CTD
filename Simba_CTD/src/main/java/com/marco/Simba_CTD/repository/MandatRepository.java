package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.Mandat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MandatRepository
                extends JpaRepository<Mandat, UUID> {

        /**
         * Recherche sécurisée par ID + collectivité.
         */
        Optional<Mandat> findByIdAndCollectiviteId(
                        UUID id,
                        UUID collectiviteId);

        /**
         * Tous les mandats d'une collectivité.
         */
        List<Mandat> findByCollectiviteId(
                        UUID collectiviteId);

        /**
         * Mandats créés par un ordonnateur
         * dans une collectivité.
         */
        List<Mandat> findByCollectiviteIdAndOrdonnatorId(
                        UUID collectiviteId,
                        UUID ordonnatorId);

        /**
         * Mandats ayant un état donné.
         */
        List<Mandat> findByCollectiviteIdAndEtat(
                        UUID collectiviteId,
                        Mandat.EtatMandat etat);

        /**
         * Vérifie l'unicité du numéro de mandat
         * dans une collectivité.
         */
        boolean existsByNumeroMandatAndCollectiviteId(
                        String numeroMandat,
                        UUID collectiviteId);
}