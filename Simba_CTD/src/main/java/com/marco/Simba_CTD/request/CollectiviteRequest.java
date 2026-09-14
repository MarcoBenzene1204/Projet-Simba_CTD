package com.marco.Simba_CTD.request;

import com.marco.Simba_CTD.Enum.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

//Le request ici représente le contract des donnees attendues pour la creation ou la mise à jour d'une collectivité.
public record CollectiviteRequest(
    @NotBlank @Size(max = 30) String code,
    @NotBlank @Size(max = 255) String nom,
    @NotNull TypeCollectivite type,
    @Size(max=150) String region,
    @Size(max=150) String departement,
    @Size(max=150) String arrondissement,
    String adresse,
    @Size(max = 30) String telephone,
    @Email String email,
    String logoUrl,
    StatutCollectivite statut,
    String fuseauHoraire,
    String devise,
    @Size(max = 7) String couleurPrincipale,
    @Size(max = 7) String couleurAccent
){}
