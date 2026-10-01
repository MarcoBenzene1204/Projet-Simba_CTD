package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.ApurementRegie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApurementRegieRepository extends JpaRepository<ApurementRegie, java.util.UUID> {
    @Query(value = "SELECT a.* FROM apurements_regies a "
	    + "JOIN regies_avances r ON r.id = a.regieavances_id "
	    + "JOIN utilisateurs u ON u.id = r.regisseur_id "
	    + "WHERE u.collectivite_id = :collectiviteId ORDER BY a.date_periode DESC, a.id",
	    nativeQuery = true)
    List<ApurementRegie> findAllForCollectivite(@Param("collectiviteId") UUID collectiviteId);

    @Query(value = "SELECT a.* FROM apurements_regies a "
	    + "JOIN regies_avances r ON r.id = a.regieavances_id "
	    + "JOIN utilisateurs u ON u.id = r.regisseur_id "
	    + "WHERE a.id = :id AND u.collectivite_id = :collectiviteId",
	    nativeQuery = true)
    Optional<ApurementRegie> findByIdForCollectivite(
	    @Param("id") UUID id,
	    @Param("collectiviteId") UUID collectiviteId);
}
