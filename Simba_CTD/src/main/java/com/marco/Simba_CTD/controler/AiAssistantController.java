package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.AiPromptRequest;
import com.marco.Simba_CTD.service.ArisAssistantService;
import com.marco.Simba_CTD.service.CurrentUserService;
import com.marco.Simba_CTD.service.ReportingDashboardService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AiAssistantController {

    private final ArisAssistantService arisAssistantService;
    private final CurrentUserService currentUserService;
    private final ReportingDashboardService reportingDashboardService;
    private final ObjectMapper objectMapper;

    public AiAssistantController(
            ArisAssistantService arisAssistantService,
            CurrentUserService currentUserService,
            ReportingDashboardService reportingDashboardService,
            ObjectMapper objectMapper) {
        this.arisAssistantService = arisAssistantService;
        this.currentUserService = currentUserService;
        this.reportingDashboardService = reportingDashboardService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/ai/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody AiPromptRequest request) {
        String question = request == null || request.prompt() == null ? "" : request.prompt();
        String context = request == null ? null : request.context();
        String role = currentUserService.getRoles().stream().findFirst().orElse("UTILISATEUR");
        List<String> permissions = currentUserService.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList();
        try {
            Map<String, Object> payload = arisAssistantService.answer(question, context, role, permissions, "/dashboard");
            return ResponseEntity.ok(payload);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("answer", "Le service d’analyse IA est temporairement indisponible. Vérifiez la configuration Gemini et réessayez.", "message", exception.getMessage()));
        }
    }

    @PostMapping("/assistant/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> assistantChat(@RequestBody AiPromptRequest request) {
        return chat(request);
    }

    @PostMapping("/ai/reporting")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> reporting(@RequestBody AiPromptRequest request) {
        String question = request == null || request.prompt() == null ? "" : request.prompt();
        String role = currentUserService.getRoles().stream().findFirst().orElse("UTILISATEUR");
        List<String> permissions = currentUserService.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList();

        String context = buildAuthorizedReportingContext();
        try {
            Map<String, Object> payload = arisAssistantService.answer(
                    "Analyse les indicateurs autorisés pour mon rôle et ma collectivité. " + question,
                    context,
                    role,
                    permissions,
                    "/dashboard/reporting");
            return ResponseEntity.ok(payload);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("answer", "Le service d’analyse IA est temporairement indisponible. Vérifiez la configuration Gemini et réessayez.", "message", exception.getMessage()));
        }
    }

    private String buildAuthorizedReportingContext() {
        try {
            // Never accept a reporting dataset from the browser: the service
            // builds either the current CTD view or the super-admin global view.
            return objectMapper.writeValueAsString(reportingDashboardService.buildDashboard());
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Impossible de préparer le contexte de reporting.", exception);
        }
    }
}
