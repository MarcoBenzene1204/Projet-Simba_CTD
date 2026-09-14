package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.entity.Utilisateur;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UtilisateurRepository
        extends JpaRepository<Utilisateur, UUID> {

    @EntityGraph(attributePaths = "collectivite")
    Optional<Utilisateur> findByIdentifiantKeycloak(
            String identifiantKeycloak);

    @Query("""
                SELECT u
                FROM Utilisateur u
                LEFT JOIN FETCH u.collectivite
            """)
    List<Utilisateur> findAllWithCollectivite();

    @Query("""
                SELECT u
                FROM Utilisateur u
                LEFT JOIN FETCH u.collectivite
                WHERE u.identifiantKeycloak = :keycloakId
            """)
    Optional<Utilisateur> findByKeycloakIdWithCollectivite(
            @Param("keycloakId") String keycloakId);

    boolean existsByIdentifiantKeycloak(
            String identifiantKeycloak);

    List<Utilisateur> findByCollectiviteIdAndRole(
            UUID collectiviteId,
            RoleApplication role
    );

    @EntityGraph(attributePaths = "collectivite")
    List<Utilisateur> findAllByCollectiviteId(UUID collectiviteId);

    @EntityGraph(attributePaths = "collectivite")
    Optional<Utilisateur> findByIdAndCollectiviteId(UUID id, UUID collectiviteId);

    @EntityGraph(attributePaths = "collectivite")
    List<Utilisateur> findAllByRole(RoleApplication role);

    Optional<Utilisateur> findByNomUtilisateur(
            String nomUtilisateur);

    @EntityGraph(attributePaths = "collectivite")
    Optional<Utilisateur> findByIdentifiantKeycloakOrNomUtilisateur(
            String identifiantKeycloak,
            String nomUtilisateur);
}