package com.marco.Simba_CTD.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentM5ServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private CurrentUserService currentUserService;

    @Test
    void accepteUniquementUnDocumentDuTenantEtDuTypeDemandes() {
        UUID documentId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        when(currentUserService.requireTenantId()).thenReturn(tenantId);
        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class), eq(documentId), eq(tenantId), eq("MARCHE")))
                .thenReturn(true);

        DocumentM5Service service = new DocumentM5Service(jdbcTemplate, currentUserService);

        assertTrue(service.documentExiste(documentId, "MARCHE"));
        verify(jdbcTemplate).queryForObject(anyString(), eq(Boolean.class), eq(documentId), eq(tenantId), eq("MARCHE"));
    }

    @Test
    void refuseUneReferenceVideSansInterrogerLaBase() {
        DocumentM5Service service = new DocumentM5Service(jdbcTemplate, currentUserService);

        assertFalse(service.documentExiste(null, "MARCHE"));
        verifyNoInteractions(jdbcTemplate, currentUserService);
    }
}