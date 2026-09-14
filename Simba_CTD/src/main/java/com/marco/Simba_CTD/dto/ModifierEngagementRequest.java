package com.marco.Simba_CTD.dto;

import java.util.UUID;

public record ModifierEngagementRequest(
        String objet,
        String periodicite,
        UUID contratServiceId
) {
}