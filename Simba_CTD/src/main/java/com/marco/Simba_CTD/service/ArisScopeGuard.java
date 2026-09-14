package com.marco.Simba_CTD.service;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class ArisScopeGuard {

    private static final List<String> DOMAIN_KEYWORDS = List.of(
            "simba",
            "simba_ctd",
            "collectivite",
            "collectivité",
            "engagement",
            "liquidation",
            "mandat",
            "paiement",
            "budget",
            "workflow",
            "module",
            "dashboard",
            "navigation",
            "utilisateur",
            "rôle",
            "role",
            "visa",
            "régularisation",
            "finance publique",
            "dépense",
            "dossier",
            "service fait",
            "service_fait",
            "document",
            "signature",
            "encaissement",
            "décaissement",
            "contrôle",
            "controle",
            "réception",
            "reception"
    );

    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
            "python",
            "java",
            "recette",
            "élon musk",
            "elon musk",
            "téléphone",
            "telephone",
            "meilleur téléphone",
            "programme java",
            "code java",
            "meilleur",
            "exercice physique",
            "chatgpt",
            "voiture",
            "film",
            "musique",
            "politique",
            "actualité"
    );

    public boolean isAllowed(String question) {
        if (question == null || question.isBlank()) {
            return false;
        }

        String normalized = normalize(question);

        boolean mentionsDomain = DOMAIN_KEYWORDS.stream().anyMatch(normalized::contains);
        boolean mentionsForbidden = FORBIDDEN_KEYWORDS.stream().anyMatch(normalized::contains);

        return mentionsDomain && !mentionsForbidden;
    }

    public String refusalMessage() {
        return "Je suis Aris, l'assistant de Simba_CTD. Je peux uniquement répondre aux questions relatives à Simba_CTD et à la finance publique.";
    }

    private String normalize(String value) {
        String normalized = value.toLowerCase(Locale.FRENCH);
        normalized = normalized.replace("à", "a");
        normalized = normalized.replace("â", "a");
        normalized = normalized.replace("ä", "a");
        normalized = normalized.replace("é", "e");
        normalized = normalized.replace("è", "e");
        normalized = normalized.replace("ê", "e");
        normalized = normalized.replace("ë", "e");
        normalized = normalized.replace("î", "i");
        normalized = normalized.replace("ï", "i");
        normalized = normalized.replace("ô", "o");
        normalized = normalized.replace("ö", "o");
        normalized = normalized.replace("ù", "u");
        normalized = normalized.replace("û", "u");
        normalized = normalized.replace("ü", "u");
        normalized = normalized.replace("ç", "c");
        normalized = normalized.replace("-", " ");
        normalized = normalized.replace("_", " ");
        return normalized.trim();
    }
}
