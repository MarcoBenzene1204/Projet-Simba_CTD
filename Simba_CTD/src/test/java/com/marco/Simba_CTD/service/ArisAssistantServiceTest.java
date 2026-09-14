package com.marco.Simba_CTD.service;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArisAssistantServiceTest {

    @Test
    void answerExposesAnswerFieldForTheFrontend() throws Exception {
        ArisAssistantService service = new ArisAssistantService(new ArisScopeGuard(), new OpenAiReportingService());

        Field apiKeyField = ArisAssistantService.class.getDeclaredField("apiKey");
        apiKeyField.setAccessible(true);
        apiKeyField.set(service, "test-key");

        Map<String, Object> response = service.answer(
                "Comment créer un engagement ?",
                "Contexte de test",
                "ADMINISTRATEUR",
                List.of("engagement:lire"),
                "/dashboard"
        );

        assertNotNull(response.get("answer"), "Le frontend attend un champ answer obligatoire.");
        assertTrue(response.get("answer").toString().length() > 0);
    }

    @Test
    void informationalQuestionDoesNotTriggerNavigationGuidance() throws Exception {
        ArisAssistantService service = new ArisAssistantService(new ArisScopeGuard(), new OpenAiReportingService());

        Field apiKeyField = ArisAssistantService.class.getDeclaredField("apiKey");
        apiKeyField.setAccessible(true);
        apiKeyField.set(service, "test-key");

        Map<String, Object> response = service.answer(
                "C'est quoi un engagement ?",
                "Contexte de test",
                "ADMINISTRATEUR",
                List.of("engagement:lire"),
                "/dashboard"
        );

        String answer = response.get("answer").toString();
        assertTrue(answer.toLowerCase().contains("engagement"));
        assertTrue(!answer.toLowerCase().contains("gestion budgétaire") && !answer.toLowerCase().contains("menu"));
    }
}
