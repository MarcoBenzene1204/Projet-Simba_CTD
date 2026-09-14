package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.Enum.StatutUtilisateur;
import com.marco.Simba_CTD.dto.UtilisateurDTO;
import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.repository.CollectiviteRepository;
import com.marco.Simba_CTD.repository.UtilisateurRepository;
import com.marco.Simba_CTD.request.UtilisateurRequest;
import com.marco.Simba_CTD.request.AdminCreateUtilisateurRequest;
import com.marco.Simba_CTD.request.SuperAdminCreateUtilisateurRequest;
import com.marco.Simba_CTD.request.UtilisateurStatutRequest;
import com.marco.Simba_CTD.request.UtilisateurUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class UtilisateurAdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final CollectiviteRepository collectiviteRepository;
    private final CurrentUserService currentUserService;

    public UtilisateurAdminService(
            UtilisateurRepository utilisateurRepository,
            CollectiviteRepository collectiviteRepository,
            CurrentUserService currentUserService
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.collectiviteRepository = collectiviteRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<UtilisateurDTO> lister() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean superAdministrateur = authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMINISTRATEUR"));

        Utilisateur utilisateurCourant = superAdministrateur ? null : currentUserService.getUtilisateur();
        UUID collectiviteCourante = utilisateurCourant == null || utilisateurCourant.getCollectivite() == null
            ? null : utilisateurCourant.getCollectivite().getId();

        List<Utilisateur> utilisateurs = superAdministrateur
            ? utilisateurRepository.findAllWithCollectivite()
            : utilisateurRepository.findAllByCollectiviteId(collectiviteCourante);

        return utilisateurs.stream()
            .map(this::versDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UtilisateurDTO> listerAdministrateurs() {
        return utilisateurRepository.findAllByRole(RoleApplication.ADMINISTRATEUR)
                .stream().map(this::versDTO).toList();
    }

    @Transactional(readOnly = true)
    public UtilisateurDTO consulter(UUID id) {
        return versDTO(utilisateurPourCourant(id));
    }

    public UtilisateurDTO creerAdministrateur(SuperAdminCreateUtilisateurRequest request) {
        verifierIdentifiantDisponible(request.identifiantKeycloak());
        Collectivite collectivite = collectiviteRepository.findById(request.collectiviteId())
                .orElseThrow(() -> new IllegalArgumentException("Collectivité introuvable."));
        Utilisateur utilisateur = new Utilisateur(
                request.identifiantKeycloak().trim(), request.nomUtilisateur(), request.prenom(),
                request.nom(), request.email(), request.telephone(), request.matricule(),
                collectivite, RoleApplication.ADMINISTRATEUR, StatutUtilisateur.ACTIF);
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO creerUtilisateurDeMaCollectivite(AdminCreateUtilisateurRequest request) {
        if (request.role() == RoleApplication.ADMINISTRATEUR
                || request.role() == RoleApplication.SUPER_ADMINISTRATEUR) {
            throw new IllegalArgumentException("Ce rôle ne peut pas être créé par un administrateur.");
        }
        verifierIdentifiantDisponible(request.identifiantKeycloak());
        Collectivite collectivite = currentUserService.getUtilisateur().getCollectivite();
        if (collectivite == null) {
            throw new IllegalStateException("L'administrateur n'est associé à aucune collectivité.");
        }
        Utilisateur utilisateur = new Utilisateur(
                request.identifiantKeycloak().trim(), request.nomUtilisateur(), request.prenom(),
                request.nom(), request.email(), request.telephone(), request.matricule(),
                collectivite, request.role(), StatutUtilisateur.ACTIF);
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO modifier(UUID id, UtilisateurUpdateRequest request) {
        Utilisateur utilisateur = utilisateurPourCourant(id);
        if (request.role() == RoleApplication.ADMINISTRATEUR
                || request.role() == RoleApplication.SUPER_ADMINISTRATEUR) {
            throw new IllegalArgumentException("Un administrateur ne peut pas attribuer ce rôle.");
        }
        appliquerModification(utilisateur, request);
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO modifierStatut(UUID id, UtilisateurStatutRequest request) {
        Utilisateur utilisateur = utilisateurPourCourant(id);
        utilisateur.setStatut(request.statut());
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO modifierAdministrateur(UUID id, UtilisateurUpdateRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable."));
        if (utilisateur.getRole() != RoleApplication.ADMINISTRATEUR) {
            throw new IllegalArgumentException("Le profil ciblé n'est pas un administrateur.");
        }
        appliquerModification(utilisateur, request);
        utilisateur.setRole(RoleApplication.ADMINISTRATEUR);
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO modifierStatutAdministrateur(UUID id, UtilisateurStatutRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable."));
        if (utilisateur.getRole() != RoleApplication.ADMINISTRATEUR) {
            throw new IllegalArgumentException("Le profil ciblé n'est pas un administrateur.");
        }
        utilisateur.setStatut(request.statut());
        return versDTO(utilisateurRepository.save(utilisateur));
    }

    private void verifierIdentifiantDisponible(String identifiantKeycloak) {
        if (utilisateurRepository.existsByIdentifiantKeycloak(identifiantKeycloak.trim())) {
            throw new IllegalArgumentException("Ce compte Keycloak est déjà associé à un utilisateur.");
        }
    }

    private Utilisateur utilisateurPourCourant(UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean superAdministrateur = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMINISTRATEUR"));
        if (superAdministrateur) {
            return utilisateurRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
        }
        Collectivite collectivite = currentUserService.getUtilisateur().getCollectivite();
        if (collectivite == null) {
            throw new IllegalStateException("Aucune collectivité n'est associée à l'administrateur.");
        }
        return utilisateurRepository.findByIdAndCollectiviteId(id, collectivite.getId())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable dans votre collectivité."));
    }

    private void appliquerModification(Utilisateur utilisateur, UtilisateurUpdateRequest request) {
        if (request.nomUtilisateur() != null) utilisateur.setNomUtilisateur(request.nomUtilisateur());
        if (request.prenom() != null) utilisateur.setPrenom(request.prenom());
        if (request.nom() != null) utilisateur.setNom(request.nom());
        if (request.email() != null) utilisateur.setEmail(request.email());
        if (request.telephone() != null) utilisateur.setTelephone(request.telephone());
        if (request.matricule() != null) utilisateur.setMatricule(request.matricule());
        if (request.role() != null) utilisateur.setRole(request.role());
    }

    public UtilisateurDTO creer(UtilisateurRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean superAdministrateur = authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMINISTRATEUR"));

        // Règle métier: super-admin ne crée que des administrateurs
        if (superAdministrateur && request.role() != RoleApplication.ADMINISTRATEUR) {
            throw new IllegalArgumentException("Le super-administrateur ne peut créer que des administrateurs.");
        }
        if (!superAdministrateur && request.role() == RoleApplication.ADMINISTRATEUR) {
            throw new IllegalArgumentException("Seul le super-administrateur peut créer un administrateur.");
        }
        if (request.role() == RoleApplication.SUPER_ADMINISTRATEUR) {
            throw new IllegalArgumentException("Création de SUPER_ADMINISTRATEUR interdite via API.");
        }
        if (utilisateurRepository.existsByIdentifiantKeycloak(request.identifiantKeycloak())) {
            throw new IllegalArgumentException("Ce compte Keycloak est déjà associé à un utilisateur.");
        }

        Collectivite collectivite = null;
        if (request.role() != RoleApplication.SUPER_ADMINISTRATEUR) {
            UUID collectiviteId;
            if (superAdministrateur) {
                if (request.collectiviteId() == null) {
                    throw new IllegalArgumentException("Une collectivité est obligatoire pour ce rôle.");
                }
                collectiviteId = request.collectiviteId();
            } else {
                Collectivite collectiviteCourante = currentUserService.getUtilisateur().getCollectivite();
                if (collectiviteCourante == null) {
                    throw new IllegalArgumentException("Votre compte administrateur n'est associé à aucune commune.");
                }
                if (request.collectiviteId() != null
                        && !request.collectiviteId().equals(collectiviteCourante.getId())) {
                    throw new IllegalArgumentException("Un administrateur ne peut créer un utilisateur que dans sa commune.");
                }
                collectiviteId = collectiviteCourante.getId();
            }
            collectivite = collectiviteRepository.findById(collectiviteId)
                    .orElseThrow(() -> new IllegalArgumentException("Collectivité introuvable."));
        }

        Utilisateur utilisateur = new Utilisateur(
                request.identifiantKeycloak().trim(),
                request.nomUtilisateur(),
                request.prenom(),
                request.nom(),
                request.email(),
                request.telephone(),
                request.matricule(),
                collectivite,
                request.role(),
                StatutUtilisateur.ACTIF
        );

        return versDTO(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDTO modifier(UUID id, Map<String, String> changements) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean superAdministrateur = authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMINISTRATEUR"));

        Utilisateur utilisateur = utilisateurPourCourant(id);

        // Protection SUPER_ADMINISTRATEUR
        if (utilisateur.getRole() == RoleApplication.SUPER_ADMINISTRATEUR && !superAdministrateur) {
            throw new IllegalArgumentException("Seul le super-administrateur peut modifier cet utilisateur.");
        }
        if (!superAdministrateur && utilisateur.getRole() == RoleApplication.ADMINISTRATEUR) {
            throw new IllegalArgumentException("Un administrateur ne peut pas modifier un autre administrateur.");
        }
        
        // Un admin ne peut pas s'octroyer SUPER_ADMINISTRATEUR
        if (changements.containsKey("role")) {
            RoleApplication nouveauRole = RoleApplication.valueOf(changements.get("role"));
            if (nouveauRole == RoleApplication.SUPER_ADMINISTRATEUR && !superAdministrateur) {
                throw new IllegalArgumentException("Promotion en SUPER_ADMINISTRATEUR interdite.");
            }
            utilisateur.setRole(nouveauRole);
        }
        if (changements.containsKey("statut")) {
            utilisateur.setStatut(StatutUtilisateur.valueOf(changements.get("statut")));
        }
        if (changements.containsKey("collectiviteId")) {
            String val = changements.get("collectiviteId");
            if (val == null || val.isBlank()) {
                if (!superAdministrateur) {
                    throw new IllegalArgumentException("Un administrateur ne peut pas retirer la collectivité.");
                }
                utilisateur.setCollectivite(null);
            } else {
                UUID newCollectiviteId = UUID.fromString(val);
                // Un admin ne peut pas déplacer un user hors de sa commune
                if (!superAdministrateur) {
                    UUID maCollectivite = currentUserService.getUtilisateur().getCollectivite().getId();
                    if (!newCollectiviteId.equals(maCollectivite)) {
                        throw new IllegalArgumentException("Déplacement hors de votre commune interdit.");
                    }
                }
                utilisateur.setCollectivite(collectiviteRepository.findById(newCollectiviteId)
                        .orElseThrow(() -> new IllegalArgumentException("Collectivité introuvable.")));
            }
        }

        return versDTO(utilisateurRepository.save(utilisateur));
    }

    private UtilisateurDTO versDTO(Utilisateur utilisateur) {
        Collectivite collectivite = utilisateur.getCollectivite();
        return new UtilisateurDTO(
                utilisateur.getId(),
                utilisateur.getIdentifiantKeycloak(),
                utilisateur.getNomUtilisateur(),
                utilisateur.getPrenom(),
                utilisateur.getNom(),
                utilisateur.getEmail(),
                utilisateur.getTelephone(),
                utilisateur.getMatricule(),
                collectivite == null ? null : collectivite.getId(),
                collectivite == null ? null : collectivite.getNom(),
                utilisateur.getRole(),
                utilisateur.getStatut()
        );
    }
}