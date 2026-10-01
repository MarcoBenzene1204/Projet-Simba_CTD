package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.RoleApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class NotificationService {
    private final JdbcTemplate jdbcTemplate;
    private final CurrentUserService currentUserService;

    public NotificationService(JdbcTemplate jdbcTemplate, CurrentUserService currentUserService) {
        this.jdbcTemplate = jdbcTemplate;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public void notifierRoles(UUID collectiviteId, Collection<RoleApplication> roles, UUID auteurId,
            String type, String titre, String message, String lien) {
        if (collectiviteId == null || roles == null || roles.isEmpty()) return;
        Set<UUID> destinataires = new LinkedHashSet<>();
        for (RoleApplication role : roles) {
            destinataires.addAll(jdbcTemplate.query(
                    "SELECT id FROM utilisateurs WHERE collectivite_id = ? AND role::text = ? AND statut::text = 'ACTIF'",
                    (resultSet, rowNum) -> resultSet.getObject("id", UUID.class), collectiviteId, role.name()));
        }
        destinataires.remove(auteurId);
        destinataires.forEach(id -> creer(id, collectiviteId, type, titre, message, lien));
    }

    @Transactional
    public void notifierUtilisateur(UUID destinataireId, UUID collectiviteId, String type, String titre,
            String message, String lien) {
        if (destinataireId == null || collectiviteId == null) return;
        creer(destinataireId, collectiviteId, type, titre, message, lien);
    }

    @Transactional(readOnly = true)
    public CentreNotifications lister(int limiteDemandee) {
        UUID utilisateurId = currentUserService.getUtilisateur().getId();
        int limite = Math.max(1, Math.min(limiteDemandee, 100));
        List<Notification> items = jdbcTemplate.query(
                "SELECT id, collectivite_id, type, titre, message, lien, cree_le, lu_le "
                        + "FROM simba_notifications WHERE destinataire_id = ? ORDER BY cree_le DESC LIMIT ?",
                (resultSet, rowNum) -> new Notification(
                        resultSet.getObject("id", UUID.class),
                        resultSet.getObject("collectivite_id", UUID.class),
                        resultSet.getString("type"),
                        resultSet.getString("titre"),
                        resultSet.getString("message"),
                        resultSet.getString("lien"),
                        toLocalDateTime(resultSet.getTimestamp("cree_le")),
                        toLocalDateTime(resultSet.getTimestamp("lu_le")),
                        resultSet.getTimestamp("lu_le") != null),
                utilisateurId, limite);
        Long nonLues = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM simba_notifications WHERE destinataire_id = ? AND lu_le IS NULL",
                Long.class, utilisateurId);
        return new CentreNotifications(items, nonLues == null ? 0 : nonLues);
    }

    @Transactional
    public boolean marquerLue(UUID notificationId) {
        return jdbcTemplate.update(
                "UPDATE simba_notifications SET lu_le = COALESCE(lu_le, CURRENT_TIMESTAMP) WHERE id = ? AND destinataire_id = ?",
                notificationId, currentUserService.getUtilisateur().getId()) > 0;
    }

    @Transactional
    public int marquerToutesLues() {
        return jdbcTemplate.update(
                "UPDATE simba_notifications SET lu_le = CURRENT_TIMESTAMP WHERE destinataire_id = ? AND lu_le IS NULL",
                currentUserService.getUtilisateur().getId());
    }

    private void creer(UUID destinataireId, UUID collectiviteId, String type, String titre,
            String message, String lien) {
        jdbcTemplate.update(
                "INSERT INTO simba_notifications (destinataire_id, collectivite_id, type, titre, message, lien) VALUES (?, ?, ?, ?, ?, ?)",
                destinataireId, collectiviteId, type, titre, message, lien);
    }

    private static LocalDateTime toLocalDateTime(Timestamp value) {
        return value == null ? null : value.toLocalDateTime();
    }

    public record Notification(UUID id, UUID collectiviteId, String type, String titre, String message,
            String lien, LocalDateTime creeLe, LocalDateTime luLe, boolean lue) {}

    public record CentreNotifications(List<Notification> notifications, long nonLues) {}
}