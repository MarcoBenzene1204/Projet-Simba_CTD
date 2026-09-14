package com.marco.Simba_CTD.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ArisScopeGuardTest {

    private final ArisScopeGuard guard = new ArisScopeGuard();

    @Test
    void shouldAcceptSimbaCtdDomainQuestions() {
        assertThat(guard.isAllowed("Comment créer un engagement ?")).isTrue();
        assertThat(guard.isAllowed("Où trouver les mandats ?")).isTrue();
    }

    @Test
    void shouldRejectOutOfScopeQuestions() {
        assertThat(guard.isAllowed("Écris-moi un programme Python.")).isFalse();
        assertThat(guard.isAllowed("Qui est Elon Musk ?")).isFalse();
    }
}
