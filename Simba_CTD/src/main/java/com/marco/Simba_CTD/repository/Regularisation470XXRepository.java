package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import com.marco.Simba_CTD.entity.Regularisation470XX;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface Regularisation470XXRepository
        extends JpaRepository<Regularisation470XX, UUID> {

        // =========================================================
        // LECTURE TENANT-AWARE
        // =========================================================

        List<Regularisation470XX> findByCollectiviteId(
                UUID collectiviteId);

        Optional<Regularisation470XX> findByIdAndCollectiviteId(
                UUID id,
                UUID collectiviteId);

        List<Regularisation470XX> findByEtatAndCollectiviteId(
                EtatRegularisation etat,
                UUID collectiviteId);

        // =========================================================
        // EXISTENCE
        // =========================================================

        boolean existsByReferencePaiementDetecteAndCollectiviteId(
                        String referencePaiementDetecte,
                        UUID collectiviteId);

        boolean existsByNumeroAndCollectiviteId(
                        String numero,
                        UUID collectiviteId);

        // =========================================================
        // RECHERCHE PAR REFERENCE
        // =========================================================

        Optional<Regularisation470XX> findByReferencePaiementDetecteAndCollectiviteId(
                        String referencePaiementDetecte,
                        UUID collectiviteId);

        // =========================================================
        // ECHEANCES
        // =========================================================

        List<Regularisation470XX> findByDateEcheanceRegularisationLessThanEqualAndCollectiviteId(
                        LocalDate date,
                        UUID collectiviteId);

        // =========================================================
        // ALERTES J+15
        // =========================================================

        List<Regularisation470XX> findByAlerteJ15DeclencheeFalseAndDateDetectionLessThanEqualAndCollectiviteId(
                        java.time.LocalDateTime dateDetection,
                        UUID collectiviteId);

        // =========================================================
        // ALERTES J+25
        // =========================================================

        List<Regularisation470XX> findByAlerteJ25DeclencheeFalseAndDateDetectionLessThanEqualAndCollectiviteId(
                java.time.LocalDateTime dateDetection,
                UUID collectiviteId);

        // =========================================================
        // DEPASSEMENT J+30
        // =========================================================

        List<Regularisation470XX> findByInscritRegistreAnomaliesFalseAndDateEcheanceRegularisationBeforeAndCollectiviteId(
                LocalDate date,
                UUID collectiviteId);
}