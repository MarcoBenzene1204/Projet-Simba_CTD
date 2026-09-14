package com.marco.Simba_CTD.repository;

import com.marco.Simba_CTD.entity.DepenseRegie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DépenseRegieRepository
        extends JpaRepository<DepenseRegie, UUID> {
}
