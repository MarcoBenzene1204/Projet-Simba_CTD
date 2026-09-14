package com.marco.Simba_CTD.dto;

public record AiPromptRequest(String prompt, String context) {
    public String prompt() {
        return prompt == null ? "" : prompt.trim();
    }

    public String context() {
        return context == null ? "" : context.trim();
    }
}
