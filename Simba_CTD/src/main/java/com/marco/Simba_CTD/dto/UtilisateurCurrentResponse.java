package com.marco.Simba_CTD.dto;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.Enum.StatutUtilisateur;

import java.util.List;
import java.util.UUID;

public record UtilisateurCurrentResponse(
        UUID id,
        String identifiantKeycloak,
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        String telephone,
        String matricule,
        UUID collectiviteId,
        String collectiviteNom,
        String collectiviteLogoUrl,
        String collectiviteCouleurPrincipale,
        String collectiviteCouleurAccent,
        RoleApplication role,
        StatutUtilisateur statut,
        List<String> permissions
) {
}