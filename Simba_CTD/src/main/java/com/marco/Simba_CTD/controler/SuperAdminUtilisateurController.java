package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.UtilisateurDTO;
import com.marco.Simba_CTD.request.SuperAdminCreateUtilisateurRequest;
import com.marco.Simba_CTD.request.UtilisateurStatutRequest;
import com.marco.Simba_CTD.request.UtilisateurUpdateRequest;
import com.marco.Simba_CTD.service.UtilisateurAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/super-admin/utilisateurs")
@PreAuthorize("hasRole('SUPER_ADMINISTRATEUR')")
public class SuperAdminUtilisateurController {

    private final UtilisateurAdminService service;

    public SuperAdminUtilisateurController(UtilisateurAdminService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('parametrage:lire')")
    public List<UtilisateurDTO> lister() {
        return service.listerAdministrateurs();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize ("hasAuthority('utilisateur:creer')")
    public UtilisateurDTO creer(@Valid @RequestBody SuperAdminCreateUtilisateurRequest request) {
        return service.creerAdministrateur(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize ("hasAuthority('utilisateur:modifier')")
    public UtilisateurDTO modifier(@PathVariable UUID id, @Valid @RequestBody UtilisateurUpdateRequest request) {
        return service.modifierAdministrateur(id, request);
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize ("hasAuthority('utilisateur:modifier')")
    public UtilisateurDTO modifierStatut(@PathVariable UUID id, @Valid @RequestBody UtilisateurStatutRequest request) {
        return service.modifierStatutAdministrateur(id, request);
    }
}