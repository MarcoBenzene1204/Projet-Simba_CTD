package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.config.TenantContext;
import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.repository.EngagementRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.security.SecurityContextService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LiquidationServiceTest {

    @Mock
    private LiquidationRepository liquidationRepository;

    @Mock
    private EngagementRepository engagementRepository;

    @Mock
    private SecurityContextService securityContextService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private LiquidationService liquidationService;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void attesteLeServiceFaitQuandLAgentEstPresent() {
        UUID collectiviteId = UUID.randomUUID();
        UUID liquidationId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();

        TenantContext.setTenant(collectiviteId);

        Liquidation liquidation = new Liquidation();
        liquidation.setCollectiviteId(collectiviteId);

        when(liquidationRepository.findByIdAndCollectiviteId(liquidationId, collectiviteId))
                .thenReturn(Optional.of(liquidation));
        when(securityContextService.getCurrentUserId()).thenReturn(agentId);
        when(liquidationRepository.save(liquidation)).thenReturn(liquidation);

        Liquidation result = liquidationService.attesterServiceFait(liquidationId, authentication);

        assertNotNull(result.getServiceFaitAt());
        assertEquals(agentId, result.getAgentServiceFaitId());
        assertEquals(Boolean.TRUE, result.serviceFaitEstAtteste());
    }

    @Test
    void refuseUneLiquidationPartielleQuiDepasseLeReliquatEngage() {
        UUID collectiviteId = UUID.randomUUID();
        UUID engagementId = UUID.randomUUID();

        Engagement engagement = new Engagement();
        engagement.setCollectiviteId(collectiviteId);
        engagement.setEtat(Engagement.EtatEngagement.CONFIRME);
        engagement.setMontantTTC(new BigDecimal("100.00"));

        Liquidation precedente = nouvelleLiquidation(new BigDecimal("70.00"));
        precedente.setCollectiviteId(collectiviteId);
        precedente.setEngagement(engagement);
        precedente.setEtat(Liquidation.EtatLiquidation.BROUILLON);

        Liquidation demande = nouvelleLiquidation(new BigDecimal("40.00"));

        when(engagementRepository.findByIdAndCollectiviteId(engagementId, collectiviteId))
                .thenReturn(Optional.of(engagement));
        when(liquidationRepository.existsByNumeroAndCollectiviteId(demande.getNumero(), collectiviteId))
                .thenReturn(false);
        when(liquidationRepository.existsByNumeroFactureAndCollectiviteId(
                demande.getNumeroFacture(), collectiviteId)).thenReturn(false);
        when(liquidationRepository.findByCollectiviteIdAndEngagementId(collectiviteId, engagementId))
                .thenReturn(List.of(precedente));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> liquidationService.creerLiquidation(collectiviteId, engagementId, demande));

        assertEquals("Le cumul des liquidations dépasse le montant engagé de 10.00.",
                exception.getMessage());
    }

    private Liquidation nouvelleLiquidation(BigDecimal montantHT) {
        Liquidation liquidation = new Liquidation();
        liquidation.setNumero("LIQ-" + UUID.randomUUID());
        liquidation.setTypeFacture(Liquidation.TypeFacture.PARTIELLE);
        liquidation.setNumeroFacture("FAC-" + UUID.randomUUID());
        liquidation.setDateFacture(LocalDate.now());
        liquidation.setMontantHT(montantHT);
        liquidation.setTauxTVA(BigDecimal.ZERO);
        liquidation.setTauxImpotRetenue(BigDecimal.ZERO);
        return liquidation;
    }
}
