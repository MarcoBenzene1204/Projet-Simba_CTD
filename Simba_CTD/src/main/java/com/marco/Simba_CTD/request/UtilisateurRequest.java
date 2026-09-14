package com.marco.Simba_CTD.request;

import com.marco.Simba_CTD.Enum.RoleApplication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UtilisateurRequest(
        @NotBlank String identifiantKeycloak,
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        String telephone,
        String matricule,
        @NotNull RoleApplication role,
        UUID collectiviteId
) {
}