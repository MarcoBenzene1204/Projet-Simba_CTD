package com.marco.Simba_CTD.request;

import com.marco.Simba_CTD.Enum.StatutUtilisateur;
import jakarta.validation.constraints.NotNull;

public record UtilisateurStatutRequest(@NotNull StatutUtilisateur statut) {
}