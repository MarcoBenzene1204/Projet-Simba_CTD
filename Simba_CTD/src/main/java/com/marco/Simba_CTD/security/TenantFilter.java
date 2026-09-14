package com.marco.Simba_CTD.security;

import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.config.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class TenantFilter extends OncePerRequestFilter {

    private final SecurityContextService securityContextService;

    public TenantFilter(
            SecurityContextService securityContextService) {
        this.securityContextService = securityContextService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        /*
         * Si la requête n'est pas encore authentifiée,
         * on laisse Spring Security poursuivre son traitement.
         */
        if (authentication == null
                || !authentication.isAuthenticated()) {

            filterChain.doFilter(
                    request,
                    response);

            return;
        }

        /*
         * Les endpoints publics ne nécessitent pas
         * de résolution de tenant.
         */
        if (isPublicEndpoint(request)) {

            filterChain.doFilter(
                    request,
                    response);

            return;
        }

        try {

            /*
             * Vérifie que le principal est bien notre JWT.
             */
            if (!(authentication instanceof JwtAuthenticationToken)) {

                filterChain.doFilter(
                        request,
                        response);

                return;
            }

            /*
             * Récupération de l'utilisateur Simba_CTD
             * correspondant au sub Keycloak.
             */
            Utilisateur utilisateur = securityContextService
                    .getCurrentUser();

            /*
             * Vérification du statut.
             */
            securityContextService
                    .verifierUtilisateurActif();

            /*
             * SUPER_ADMINISTRATEUR :
             *
             * Il peut ne pas avoir de collectivité.
             *
             * Les endpoints /api/super-admin/**
             * sont gérés séparément.
             */
            if (securityContextService.isSuperAdministrateur()) {

                filterChain.doFilter(
                        request,
                        response);

                return;
            }

            /*
             * Pour un utilisateur CTD classique,
             * une collectivité est obligatoire.
             */
            if (utilisateur.getCollectivite() == null) {

                response.sendError(
                        HttpServletResponse.SC_FORBIDDEN,
                        "Aucune collectivité n'est associée "
                                + "à cet utilisateur.");

                return;
            }

            /*
             * Résolution du tenant.
             */
            UUID collectiviteId = utilisateur
                    .getCollectivite()
                    .getId();

            if (collectiviteId == null) {

                response.sendError(
                        HttpServletResponse.SC_FORBIDDEN,
                        "La collectivité de l'utilisateur "
                                + "est invalide.");

                return;
            }

            /*
             * On expose l'identifiant du tenant dans
             * les attributs de la requête.
             *
             * Cela peut être utile à d'autres composants
             * pendant la durée de la requête.
             */
            request.setAttribute(
                    "collectiviteId",
                    collectiviteId);
            TenantContext.setTenant(collectiviteId);

            try {
                filterChain.doFilter(request, response);
            } finally {
                TenantContext.clear();
            }

        } catch (SecurityException | IllegalStateException exception) {

            response.sendError(
                    HttpServletResponse.SC_FORBIDDEN,
                    exception.getMessage());
        }
    }

    // =========================================================
    // ENDPOINTS PUBLICS
    // =========================================================

    private boolean isPublicEndpoint(
            HttpServletRequest request) {

        String uri = request.getRequestURI();

        return uri.startsWith("/api/public/")
                || uri.equals("/actuator/health")
                || request.getMethod().equalsIgnoreCase("OPTIONS");
    }
}