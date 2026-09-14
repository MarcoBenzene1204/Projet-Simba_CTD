package com.marco.Simba_CTD.dto;

import com.marco.Simba_CTD.Enum.*;
import java.time.OffsetDateTime;
import java.util.UUID;

//Cette classe represente le contrat entre le backend et le frontend
public record CollectiviteDTO(
  UUID id,
  String code,
  String nom,
  TypeCollectivite type,
  String region,
  String departement,
  String arrondissement,
  String adresse,
  String email,
  String telephone,
  String logoUrl,
  StatutCollectivite statut,
  String fuseauHoraire,
  String devise,
  String couleurPrincipale,
  String couleurAccent,
  OffsetDateTime createdAt,
  OffsetDateTime updatedAt
    ){}

//Le DTO presente le contrat des donnees envoyé au frontend lors d'une reponse de la base de donnees.
//c'est en quelque sorte ce que tu acceptes de presenter au frontend.
