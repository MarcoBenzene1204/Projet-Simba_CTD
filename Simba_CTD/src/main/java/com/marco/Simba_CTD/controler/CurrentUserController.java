package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.UtilisateurCurrentResponse;
import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.service.CurrentUserService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;


@RestController
@RequestMapping("/api/auth")
public class CurrentUserController {

    private final CurrentUserService currentUserService;

    public CurrentUserController(
            CurrentUserService currentUserService
    ) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public UtilisateurCurrentResponse me() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifié.");
        }

        Utilisateur utilisateur = currentUserService.getUtilisateur();
        if (utilisateur == null) {
            throw new IllegalStateException("Utilisateur courant introuvable.");
        }

        Collectivite collectivite = utilisateur.getCollectivite();

        var permissions = authentication.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .filter(authority -> !authority.startsWith("ROLE_"))
            .toList();

        return new UtilisateurCurrentResponse(
                utilisateur.getId(),
                utilisateur.getIdentifiantKeycloak(),
                utilisateur.getNomUtilisateur(),
                utilisateur.getPrenom(),
                utilisateur.getNom(),
                utilisateur.getEmail(),
                utilisateur.getTelephone(),
                utilisateur.getMatricule(),
                collectivite == null ? null : collectivite.getId(),
                collectivite == null ? null : collectivite.getNom(),
                collectivite == null ? null : collectivite.getLogoUrl(),
                collectivite == null ? null : collectivite.getCouleurPrincipale(),
                collectivite == null ? null : collectivite.getCouleurAccent(),
                utilisateur.getRole(),
                utilisateur.getStatut(),
                permissions);
    }
}

