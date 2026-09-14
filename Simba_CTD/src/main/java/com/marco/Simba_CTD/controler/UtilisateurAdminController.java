package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.UtilisateurDTO;
import com.marco.Simba_CTD.request.UtilisateurRequest;
import com.marco.Simba_CTD.request.AdminCreateUtilisateurRequest;
import com.marco.Simba_CTD.request.UtilisateurStatutRequest;
import com.marco.Simba_CTD.request.UtilisateurUpdateRequest;
import com.marco.Simba_CTD.service.UtilisateurAdminService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR')")
public class UtilisateurAdminController {

    private final UtilisateurAdminService utilisateurAdminService;

    public UtilisateurAdminController(UtilisateurAdminService utilisateurAdminService) {
        this.utilisateurAdminService = utilisateurAdminService;
    }

    @GetMapping
    public List<UtilisateurDTO> lister() {
        return utilisateurAdminService.lister();
    }

    @GetMapping("/{id}")
    public UtilisateurDTO consulter(@PathVariable UUID id) {
        return utilisateurAdminService.consulter(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurDTO creer(@Valid @RequestBody UtilisateurRequest request) {
        return utilisateurAdminService.creer(request);
    }

    @PostMapping("/admin-only")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurDTO creerUtilisateur(@Valid @RequestBody AdminCreateUtilisateurRequest request) {
        return utilisateurAdminService.creerUtilisateurDeMaCollectivite(request);
    }

    @PatchMapping("/{id}")
    public UtilisateurDTO modifier(@PathVariable UUID id, @RequestBody Map<String, String> changements) {
        return utilisateurAdminService.modifier(id, changements);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public UtilisateurDTO modifier(@PathVariable UUID id, @Valid @RequestBody UtilisateurUpdateRequest request) {
        return utilisateurAdminService.modifier(id, request);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/statut")
    public UtilisateurDTO modifierStatut(@PathVariable UUID id, @Valid @RequestBody UtilisateurStatutRequest request) {
        return utilisateurAdminService.modifierStatut(id, request);
    }
}