package com.marco.Simba_CTD.controler;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public Map<String, String> test() {
        return Map.of(
                "message", "Accès administrateur autorisé",
                "status", "OK"
        );
    }
}
