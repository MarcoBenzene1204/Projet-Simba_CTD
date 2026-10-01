package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public NotificationService.CentreNotifications lister(
            @RequestParam(defaultValue = "50") int limite) {
        return notificationService.lister(limite);
    }

    @PatchMapping("/{id}/lue")
    public void marquerLue(@PathVariable UUID id) {
        if (!notificationService.marquerLue(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable.");
        }
    }

    @PatchMapping("/lire-tout")
    public int marquerToutesLues() {
        return notificationService.marquerToutesLues();
    }
}