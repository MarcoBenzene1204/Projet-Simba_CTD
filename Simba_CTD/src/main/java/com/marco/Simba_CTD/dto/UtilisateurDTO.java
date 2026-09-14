package com.marco.Simba_CTD.dto;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.Enum.StatutUtilisateur;

import java.util.UUID;

public record UtilisateurDTO(

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

        RoleApplication role,

        StatutUtilisateur statut

) {
}
