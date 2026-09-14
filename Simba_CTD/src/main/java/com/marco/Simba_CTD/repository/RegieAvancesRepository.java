package com.marco.Simba_CTD.repository;
import com.marco.Simba_CTD.entity.RegieAvances;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RegieAvancesRepository extends JpaRepository<RegieAvances, java.util.UUID> {
    List<RegieAvances> findByRegisseurIdAndEtat(UUID regisseurId, RegieAvances.EtatRegie etat);

    List<RegieAvances> findByRegieClotureExerciceFalse();
}
