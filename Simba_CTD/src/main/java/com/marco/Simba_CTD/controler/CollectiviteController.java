package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.CollectiviteDTO;
import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.mapper.CollectiviteMapper;
import com.marco.Simba_CTD.repository.CollectiviteRepository;
import com.marco.Simba_CTD.request.CollectiviteRequest;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collectivites")
@PreAuthorize("hasRole('SUPER_ADMINISTRATEUR')")
public class CollectiviteController {

    private final CollectiviteRepository repository;
    private final CollectiviteMapper mapper;

    public CollectiviteController(
        CollectiviteRepository repository,
        CollectiviteMapper mapper
    ) {
        this.repository = repository;
        this.mapper = mapper;
    }


    // LISTE DES COLLECTIVITÉS

    @GetMapping
    public List<CollectiviteDTO> findAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }


    // UNE COLLECTIVITÉ

    @GetMapping("/{id}")
    public ResponseEntity<CollectiviteDTO> findById(
        @PathVariable UUID id
    ) {

        return repository.findById(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // CRÉATION

    @PostMapping
    public ResponseEntity<CollectiviteDTO> create(
        @Valid @RequestBody CollectiviteRequest request
    ) {

        Collectivite entity = mapper.toEntity(request);
        Collectivite saved = repository.save(entity);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(mapper.toDTO(saved));
    }


    // MODIFICATION

    @PutMapping("/{id}")
    public ResponseEntity<CollectiviteDTO> update(
        @PathVariable UUID id,
        @Valid @RequestBody CollectiviteRequest request
    ) {

        return repository.findById(id)
                .map(entity -> {

                    mapper.updateEntity(entity, request);

                    Collectivite updated = repository.save(entity);

                    return ResponseEntity.ok(mapper.toDTO(updated));

                })
                .orElse(ResponseEntity.notFound().build());
    }


    // SUPPRESSION

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id
    ) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
