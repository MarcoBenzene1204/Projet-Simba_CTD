package com.marco.Simba_CTD.request;

import com.marco.Simba_CTD.Enum.RoleApplication;

public record UtilisateurUpdateRequest(
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        String telephone,
        String matricule,
        RoleApplication role
) {
}