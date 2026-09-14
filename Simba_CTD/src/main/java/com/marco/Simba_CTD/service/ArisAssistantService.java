package com.marco.Simba_CTD.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ArisAssistantService {

    private final ArisScopeGuard scopeGuard;
    private final OpenAiReportingService openAiReportingService;

    @Value("${gemini.api.key:}")
    private String apiKey;

    public ArisAssistantService(
            ArisScopeGuard scopeGuard,
            OpenAiReportingService openAiReportingService) {
        this.scopeGuard = scopeGuard;
        this.openAiReportingService = openAiReportingService;
    }

    public Map<String, Object> answer(
            String question,
            String context,
            String role,
            List<String> permissions,
            String currentRoute) {

        if (question == null || question.isBlank()) {
            return response("Je suis Aris, l'assistant de Simba_CTD. Posez une question sur le fonctionnement, la navigation ou les workflows Simba_CTD.");
        }

        String normalizedQuestion = question.trim();

        if (!scopeGuard.isAllowed(normalizedQuestion)) {
            return response(scopeGuard.refusalMessage());
        }

        if (isInformationalQuestion(normalizedQuestion)) {
            return buildResponseWithAnswer(buildInformationalAnswer(normalizedQuestion), null);
        }

        if (isNavigationIntent(normalizedQuestion)) {
            String navigationalAnswer = buildNavigationAnswer(normalizedQuestion, role, permissions);
            Map<String, Object> response = new HashMap<>();
            response.put("answer", navigationalAnswer);
            response.put("message", navigationalAnswer);
            if (canAccessFeature(normalizedQuestion, role, permissions)) {
                response.put("action", buildAction(normalizedQuestion, role, permissions));
            }
            return response;
        }

        if (hasUnauthorizedActionIntent(normalizedQuestion, role, permissions)) {
            return response(buildUnauthorizedActionMessage(normalizedQuestion, role, permissions));
        }

        String contextualPrompt = buildContextualPrompt(normalizedQuestion, context, role, permissions, currentRoute);
        String answerText;

        if (apiKey == null || apiKey.isBlank()) {
            // The assistant remains useful for navigation when no provider is
            // configured, but it must not pretend that a requested analysis ran.
            answerText = buildFallbackAnswer(question, role, permissions, currentRoute);
        } else {
            answerText = openAiReportingService.generateResponse(contextualPrompt, context);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("answer", answerText);
        response.put("message", answerText);

        if (hasNavigationIntent(question, permissions, role)) {
            response.put("action", buildAction(question, role, permissions));
        }

        return response;
    }

    private Map<String, Object> response(String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("answer", message);
        payload.put("message", message);
        return payload;
    }

    private Map<String, Object> buildResponseWithAnswer(String answer, Map<String, Object> extraData) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("answer", answer);
        payload.put("message", answer);
        if (extraData != null) {
            payload.putAll(extraData);
        }
        return payload;
    }

    private String buildContextualPrompt(
            String question,
            String context,
            String role,
            List<String> permissions,
            String currentRoute) {

        return "Tu es Aris, l'assistant de Simba_CTD. Réponds uniquement sur Simba_CTD et la finance publique. " +
                "Si les données ne sont pas disponibles, précise que les données nécessaires ne sont pas disponibles. " +
                "Toujours présenter une hypothèse comme Cause potentielle : ... et jamais comme un fait. " +
                "Contexte: rôle=" + Objects.toString(role, "inconnu") + ", permissions=" + permissions + ", route=" + Objects.toString(currentRoute, "inconnu") + ". " +
                "Question: " + question + "\n" +
                (context == null ? "" : "Contexte métier: " + context);
    }

    private boolean isInformationalQuestion(String question) {
        String normalized = question.toLowerCase();
        boolean asksDefinition = normalized.contains("c'est quoi") || normalized.contains("quest ce que") || normalized.contains("quoi")
                || normalized.contains("definition") || normalized.contains("définition") || normalized.contains("signification")
                || normalized.contains("explication") || normalized.contains("comprendre") || normalized.contains("description");
        boolean asksNavigation = normalized.contains("ou trouver") || normalized.contains("ou est") || normalized.contains("comment acceder")
                || normalized.contains("comment ouvrir") || normalized.contains("aller dans") || normalized.contains("dans quel menu")
                || normalized.contains("tableau de bord") || normalized.contains("navigation") || normalized.contains("menu");
        return asksDefinition && !asksNavigation;
    }

    private boolean isNavigationIntent(String question) {
        String normalized = question.toLowerCase();
        return normalized.contains("ou trouver") || normalized.contains("ou est") || normalized.contains("comment acceder")
                || normalized.contains("comment ouvrir") || normalized.contains("aller dans") || normalized.contains("dans quel menu")
                || normalized.contains("menu") || normalized.contains("navigation") || normalized.contains("tableau de bord")
                || normalized.contains("ouvrir le module") || normalized.contains("acceder au module");
    }

    private boolean hasNavigationIntent(String question, List<String> permissions, String role) {
        return isNavigationIntent(question);
    }

    private boolean canAccessFeature(String question, String role, List<String> permissions) {
        String normalized = question.toLowerCase();

        if (normalized.contains("engagement")) {
            return hasPermission(permissions, "engagement:lire") || hasRole(role, "ORDONNATEUR");
        }
        if (normalized.contains("mandat")) {
            return hasPermission(permissions, "mandat:lire") || hasRole(role, "ORDONNATEUR");
        }
        if (normalized.contains("liquidation")) {
            return hasPermission(permissions, "liquidation:lire") || hasRole(role, "ORDONNATEUR");
        }
        if (normalized.contains("paiement") || normalized.contains("paiements")) {
            return hasPermission(permissions, "paiement:lire") || hasRole(role, "ORDONNATEUR");
        }
        if (normalized.contains("dashboard") || normalized.contains("tableau de bord")) {
            return true;
        }
        return true;
    }

    private String buildInformationalAnswer(String question) {
        String normalized = question.toLowerCase();

        if (normalized.contains("engagement")) {
            return "Un engagement est un acte de décision ou de prise en charge budgétaire qui consacre une dépense ou une obligation de paiement dans Simba_CTD. Il constitue la base avant la liquidation, le mandat et le paiement.";
        }
        if (normalized.contains("mandat")) {
            return "Un mandat est l’ordre de payer donné au service comptable ou au receveur après vérification du dossier. Il est le support de la procédure de paiement dans le cadre de la finance publique.";
        }
        if (normalized.contains("liquidation")) {
            return "La liquidation correspond au contrôle et à l’appréciation du montant dû au titre d’un service fait ou d’une dépense autorisée. Elle intervient avant le mandat et le paiement.";
        }
        if (normalized.contains("paiement") || normalized.contains("paiements")) {
            return "Le paiement est l’exécution effective du mandat et la sortie d’argent ou de crédit au bénéficiaire, selon le cadre budgétaire et les règles de la finance publique.";
        }
        if (normalized.contains("dashboard") || normalized.contains("tableau de bord")) {
            return "Le tableau de bord est l’espace de pilotage qui centralise les indicateurs, les performances et les alertes pour un suivi de l’activité et des risques.";
        }

        return "Dans Simba_CTD, cette notion correspond à un élément du cycle de la dépense publique : engagement, liquidation, mandat puis paiement. Le contexte précis dépend du module concerné.";
    }

    private String buildNavigationAnswer(String question, String role, List<String> permissions) {
        String normalized = question.toLowerCase();

        if (normalized.contains("engagement")) {
            if (canAccessFeature(normalized, role, permissions)) {
                return "Pour accéder au module Engagements, ouvrez le menu Gestion budgétaire puis Engagements. Une fois dans le module, vous pouvez consulter et traiter les dossiers selon vos droits.";
            }
            return "Il s’agit bien d’une question de navigation, mais votre profil actuel n’a pas les autorisations nécessaires pour accéder directement à ce module.";
        }
        if (normalized.contains("mandat")) {
            if (canAccessFeature(normalized, role, permissions)) {
                return "Pour aller vers les mandats, ouvrez le menu Gestion budgétaire puis Mandats. Vous pourrez alors suivre le cycle de validation et de traitement.";
            }
            return "Il s’agit bien d’une question de navigation, mais votre profil actuel n’a pas les autorisations nécessaires pour ouvrir ce module.";
        }
        if (normalized.contains("liquidation")) {
            if (canAccessFeature(normalized, role, permissions)) {
                return "Pour accéder aux liquidations, ouvrez le menu Gestion budgétaire puis Liquidations. Ce module permet de contrôler les montants avant le mandat et le paiement.";
            }
            return "La navigation vers ce module est possible pour les profils autorisés, mais votre profil actuel n’a pas les droits nécessaires.";
        }
        if (normalized.contains("paiement") || normalized.contains("paiements")) {
            if (canAccessFeature(normalized, role, permissions)) {
                return "Pour aller vers les paiements, ouvrez le menu Gestion budgétaire puis Paiements. Vous y trouverez le traitement des ordres de paiement et leur suivi.";
            }
            return "La navigation vers ce module est réservée aux profils autorisés. Votre profil actuel n’a pas les droits nécessaires.";
        }
        if (normalized.contains("dashboard") || normalized.contains("tableau de bord")) {
            return "Pour ouvrir le tableau de bord, utilisez le menu principal de Simba_CTD puis sélectionnez le module de pilotage ou le tableau de bord de votre rôle.";
        }

        return "Pour naviguer dans Simba_CTD, utilisez le menu principal selon votre profil et vos autorisations. Si un module est inaccessible, votre profil ne dispose pas des droits nécessaires.";
    }

    private boolean hasUnauthorizedActionIntent(String question, String role, List<String> permissions) {
        String normalized = question.toLowerCase();

        if (normalized.contains("supprimer") || normalized.contains("modifier") || normalized.contains("valider") || normalized.contains("créer") || normalized.contains("creer") || normalized.contains("soumettre")) {
            if (normalized.contains("engagement") && !hasPermission(permissions, "engagement:creer") && !hasRole(role, "ORDONNATEUR")) {
                return true;
            }
            if (normalized.contains("mandat") && !hasPermission(permissions, "mandat:lire") && !hasRole(role, "ORDONNATEUR")) {
                return true;
            }
            if (normalized.contains("liquidation") && !hasPermission(permissions, "liquidation:lire") && !hasRole(role, "ORDONNATEUR")) {
                return true;
            }
            if ((normalized.contains("paiement") || normalized.contains("paiements")) && !hasPermission(permissions, "paiement:lire") && !hasRole(role, "ORDONNATEUR")) {
                return true;
            }
        }

        return false;
    }

    private String buildUnauthorizedActionMessage(String question, String role, List<String> permissions) {
        String lower = question.toLowerCase();

        if (lower.contains("engagement")) {
            return "Je suis Aris. Vous ne pouvez pas effectuer cette action car votre profil actuel n’a pas les autorisations nécessaires pour gérer les engagements.";
        }
        if (lower.contains("mandat")) {
            return "Je suis Aris. Cette action n’est pas autorisée pour votre profil. Les mandats sont réservés aux profils ayant les droits correspondants.";
        }
        if (lower.contains("liquidation")) {
            return "Je suis Aris. Vous ne disposez pas des autorisations nécessaires pour traiter les liquidations.";
        }
        if (lower.contains("paiement") || lower.contains("paiements")) {
            return "Je suis Aris. Cette action dépasse vos droits actuels. Vous n’avez pas les autorisations nécessaires pour gérer les paiements.";
        }

        return "Je suis Aris. Vous n’avez pas les autorisations nécessaires pour effectuer cette action dans Simba_CTD.";
    }

    private Map<String, Object> buildAction(String question, String role, List<String> permissions) {
        String normalized = question.toLowerCase();

        if (normalized.contains("engagement")) {
            if (hasPermission(permissions, "engagement:lire") || hasRole(role, "ORDONNATEUR")) {
                return Map.of(
                        "type", "NAVIGATE",
                        "route", "/dashboard/gestion-ordonnateur/engagement",
                        "label", "Ouvrir la gestion des engagements"
                );
            }
        }

        if (normalized.contains("mandat")) {
            if (hasPermission(permissions, "mandat:lire") || hasRole(role, "ORDONNATEUR")) {
                return Map.of(
                        "type", "NAVIGATE",
                        "route", "/dashboard/gestion-ordonnateur/mandats",
                        "label", "Ouvrir la liste des mandats"
                );
            }
        }

        if (normalized.contains("liquidation")) {
            if (hasPermission(permissions, "liquidation:lire") || hasRole(role, "ORDONNATEUR")) {
                return Map.of(
                        "type", "NAVIGATE",
                        "route", "/dashboard/gestion-ordonnateur/liquidations",
                        "label", "Ouvrir la gestion des liquidations"
                );
            }
        }

        if (normalized.contains("paiement") || normalized.contains("paiements")) {
            if (hasPermission(permissions, "paiement:lire") || hasRole(role, "ORDONNATEUR")) {
                return Map.of(
                        "type", "NAVIGATE",
                        "route", "/dashboard/gestion-ordonnateur/paiements",
                        "label", "Ouvrir la gestion des paiements"
                );
            }
        }

        if (normalized.contains("dashboard") || normalized.contains("tableau de bord")) {
            return Map.of(
                    "type", "NAVIGATE",
                    "route", "/dashboard",
                    "label", "Ouvrir le tableau de bord"
            );
        }

        return null;
    }

    private boolean hasPermission(List<String> permissions, String requiredPermission) {
        return permissions != null && permissions.contains(requiredPermission);
    }

    private boolean hasRole(String role, String expectedRole) {
        return expectedRole.equalsIgnoreCase(role);
    }

    private String buildFallbackAnswer(
            String question,
            String role,
            List<String> permissions,
            String currentRoute) {

        String normalized = question.toLowerCase();

        if (normalized.contains("engagement")) {
            if (hasPermission(permissions, "engagement:lire") || hasRole(role, "ORDONNATEUR")) {
                return "Vous pouvez consulter et créer les engagements depuis le module Engagements. Pour accéder au module, ouvrez le menu Gestion budgétaire puis Engagements.";
            }
            return "Vous pouvez consulter la procédure d'engagement, mais la permission d'accès à ce module n'est pas disponible pour votre profil.";
        }

        if (normalized.contains("mandat")) {
            if (hasPermission(permissions, "mandat:lire") || hasRole(role, "ORDONNATEUR")) {
                return "Les mandats sont gérés depuis le module Mandats du menu Gestion budgétaire. Le suivi passe par l'état du mandat, la validation et le traitement du receveur.";
            }
            return "La consultation des mandats est limitée à votre profil et à vos permissions actuelles.";
        }

        if (normalized.contains("liquidation")) {
            if (hasPermission(permissions, "liquidation:lire") || hasRole(role, "ORDONNATEUR")) {
                return "Les liquidations se suivent depuis le module Liquidations. Elles sont liées à un engagement et sont validées par le contrôle financier avant l'ordonnancement.";
            }
            return "Vous ne disposez pas des autorisations nécessaires pour ouvrir directement ce module.";
        }

        if (normalized.contains("paiement") || normalized.contains("paiements")) {
            if (hasPermission(permissions, "paiement:lire") || hasRole(role, "ORDONNATEUR")) {
                return "Les paiements sont traités dans le module Paiements. Ils dépendent du mandat et du statut d'exécution défini par le receveur.";
            }
            return "L'accès au module de paiement n'est pas autorisé pour votre profil actuel.";
        }

        if (normalized.contains("workflow") || normalized.contains("flux") || normalized.contains("dossier")) {
            return "Dans Simba_CTD, les dossiers suivent une logique de validation progressive : engagement, liquidation, mandat puis paiement. Chaque étape est suivie dans le module correspondant.";
        }

        return "Les données nécessaires à cette analyse ne sont pas disponibles. Pour un module précis, utilisez le menu de navigation de Simba_CTD et les permissions associées à votre profil.";
    }
}
