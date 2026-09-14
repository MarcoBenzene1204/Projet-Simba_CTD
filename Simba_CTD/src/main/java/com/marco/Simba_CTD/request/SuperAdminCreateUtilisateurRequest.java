package com.marco.Simba_CTD.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SuperAdminCreateUtilisateurRequest(
        @NotBlank String identifiantKeycloak,
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        String telephone,
        String matricule,
        @NotNull UUID collectiviteId
) {
}