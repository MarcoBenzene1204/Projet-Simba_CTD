package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.Enum.StatutCollectivite;
import com.marco.Simba_CTD.Enum.TypeCollectivite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectiviteRepository extends JpaRepository<Collectivite, UUID>{
  Optional<Collectivite> findByCode(String code);
  Optional<Collectivite> findByEmail(String email);
  boolean existsByCode(String code); // exists pas exist
  boolean existsByEmail(String email);
  List<Collectivite> findByTypeAndStatut(TypeCollectivite type, StatutCollectivite statut);
  List<Collectivite> findByStatut(StatutCollectivite statut);
  List<Collectivite> findByRegion(String region);
  List<Collectivite> findByRegionAndDepartement(String region, String departement);
  @Query("SELECT c FROM Collectivite c WHERE LOWER(c.nom) LIKE LOWER(CONCAT('%', :nom, '%'))")
  List<Collectivite> searchByNom(String nom);
}
