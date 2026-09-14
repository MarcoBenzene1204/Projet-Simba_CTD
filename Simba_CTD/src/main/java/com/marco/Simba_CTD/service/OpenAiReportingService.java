package com.marco.Simba_CTD.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class OpenAiReportingService {

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    public String generateResponse(String prompt, String context) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("La clé Gemini n'est pas configurée. Ajoutez GEMINI_API_KEY dans Simba_CTD/.env .");
        }

        String finalPrompt = prompt == null ? "" : prompt.trim();
        String finalContext = context == null ? "" : context.trim();

        if (finalPrompt.isEmpty()) {
            throw new IllegalArgumentException("Le message de l'assistant ne peut pas être vide.");
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();

            Map<String, Object> systemInstruction = new LinkedHashMap<>();
            systemInstruction.put("parts", new Object[]{Map.of("text",
                    "Tu es un assistant analytique spécialisé dans Simba_CTD et la finance publique. " +
                    "Réponds uniquement dans ce domaine. Si les données sont absentes, dis : 'Les données nécessaires à cette analyse ne sont pas disponibles.' " +
                    "Pour une hypothèse, commence toujours par 'Cause potentielle : '. N'utilise jamais de fait non étayé.")});

            Map<String, Object> userContent = new LinkedHashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", new Object[]{Map.of("text",
                    (finalContext.isBlank() ? "" : "Contexte: " + finalContext + "\n\n") + finalPrompt)});

            payload.put("systemInstruction", systemInstruction);
            payload.put("contents", new Object[]{userContent});
            payload.put("generationConfig", Map.of("temperature", 0.4));

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_API_URL + model + ":generateContent"))
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new IllegalStateException("L'appel Gemini a échoué avec le code " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
            StringBuilder builder = new StringBuilder();
            for (JsonNode part : parts) {
                builder.append(part.path("text").asText());
            }
            return builder.length() > 0 ? builder.toString() : "Aucune réponse générée.";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Le calcul IA a été interrompu.", e);
        } catch (Exception e) {
            throw new IllegalStateException("Erreur lors de l'appel à l'API Gemini : " + e.getMessage(), e);
        }
    }
}
