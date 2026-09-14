package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.repository.EngagementRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.repository.PaiementRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReportingSummaryServiceTest {

    @Test
    void shouldReturnZeroedSummaryWhenTenantHasNoData() {
        EngagementRepository engagementRepository = mock(EngagementRepository.class);
        LiquidationRepository liquidationRepository = mock(LiquidationRepository.class);
        MandatRepository mandatRepository = mock(MandatRepository.class);
        PaiementRepository paiementRepository = mock(PaiementRepository.class);

        when(engagementRepository.findByCollectiviteId(UUID.fromString("00000000-0000-0000-0000-000000000001")))
                .thenReturn(List.of());
        when(liquidationRepository.findByCollectiviteId(UUID.fromString("00000000-0000-0000-0000-000000000001")))
                .thenReturn(List.of());
        when(mandatRepository.findByCollectiviteId(UUID.fromString("00000000-0000-0000-0000-000000000001")))
                .thenReturn(List.of());
        when(paiementRepository.findByCollectiviteId(UUID.fromString("00000000-0000-0000-0000-000000000001")))
                .thenReturn(List.of());

        ReportingSummaryService service = new ReportingSummaryService(
                engagementRepository,
                liquidationRepository,
                mandatRepository,
                paiementRepository
        );

        ReportingSummary summary = service.buildSummary(UUID.fromString("00000000-0000-0000-0000-000000000001"));

        assertEquals(0, summary.totalEngagements());
        assertEquals(0, summary.totalLiquidations());
        assertEquals(0, summary.totalMandats());
        assertEquals(0, summary.totalPaiements());
        assertEquals(BigDecimal.ZERO, summary.montantEngages());
        assertEquals(BigDecimal.ZERO, summary.montantLiquidations());
        assertEquals(BigDecimal.ZERO, summary.montantMandats());
        assertEquals(BigDecimal.ZERO, summary.montantPaiements());
    }
}
