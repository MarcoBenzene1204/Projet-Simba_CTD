package com.marco.Simba_CTD.service;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class ParametrageService {
    public BigDecimal obtenirTauxTVA() {
        return new BigDecimal("19.25");
    }
    public BigDecimal obtenirTauxImpotSelonNature(String natureDepense) {
        return new BigDecimal("5.50");
    }
}
