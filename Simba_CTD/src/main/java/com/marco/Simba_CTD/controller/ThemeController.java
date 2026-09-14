package com.marco.Simba_CTD.controller;

import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.service.CurrentUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ThemeController {

    private final CurrentUserService currentUserService;

    public ThemeController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/ctd/theme")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> theme() {
        Collectivite collectivite = currentUserService.getCollectivite();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", collectivite == null ? null : collectivite.getId());
        payload.put("nom", collectivite == null ? "Simba_CTD" : collectivite.getNom());
        payload.put("logo", collectivite == null ? null : collectivite.getLogoUrl());
        payload.put("couleurPrincipale", collectivite == null ? "#14532D" : collectivite.getCouleurPrincipale());
        payload.put("couleurSecondaire", collectivite == null ? "#D9A441" : collectivite.getCouleurAccent());
        payload.put("globalView", currentUserService.isSuperAdministrateur());
        return payload;
    }
}
