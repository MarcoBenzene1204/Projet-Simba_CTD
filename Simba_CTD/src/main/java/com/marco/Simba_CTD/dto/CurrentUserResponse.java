package com.marco.Simba_CTD.dto;

import java.util.List;

public record CurrentUserResponse(
        String keycloakId,
        String username,
        String email,
        String firstName,
        String lastName,
        List<String> roles
) {
}
