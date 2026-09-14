package com.marco.Simba_CTD.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class OpenAiKeyConfigurationTest {

    @Autowired
    private Environment environment;

    @Test
    void geminiKeyIsLoadedFromAppEnvironment() {
        String apiKey = environment.getProperty("gemini.api.key");

        assertFalse(
                apiKey == null || apiKey.isBlank(),
                "La clé Gemini doit être chargée depuis la configuration de l’application."
        );
    }
}
