/**
 * ================================================
 * GUIDE DE CONFIGURATION - PROJET SIMBA-CTD
 * Exécution Budgétaire des Dépenses (FC-DEP-001 à FC-DEP-006)
 * ================================================
 * 
 * Ce guide explique comment configurer et utiliser le système complet
 * d'exécution budgétaire des dépenses.
 */

// ========================================
// 1. CONFIGURATION BACKEND (Spring Boot)
// ========================================

/**
 * APPLICATION.PROPERTIES
 * 
 * # Base de données
 * spring.datasource.url=jdbc:postgresql://localhost:5432/simba_ctd
 * spring.datasource.username=simba_user
 * spring.datasource.password=your_secure_password
 * spring.jpa.hibernate.ddl-auto=validate
 * spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
 * 
 * # Keycloak (Authentification)
 * spring.security.oauth2.resourceserver.jwt.issuer-uri=https://keycloak-server/realms/simba-ctd
 * keycloak.realm=simba-ctd
 * keycloak.auth-server-url=https://keycloak-server
 * keycloak.ssl-required=external
 * keycloak.resource=simba-ctd-api
 * keycloak.bearer-only=true
 * 
 * # Logging
 * logging.level.com.simba.ctd.budget=DEBUG
 * logging.level.org.hibernate.SQL=DEBUG
 */

// ========================================
// 2. STRUCTURE DES REPOSITORIES (Interface JPA)
// ========================================

/*
// EngagementRepository.java
@Repository
public interface EngagementRepository extends JpaRepository<Engagement, String> {
    List<Engagement> findByOrdonnatorId(UUID ordonnatorId);
    List<Engagement> findByEtat(Engagement.EtatEngagement etat);
    List<Engagement> findByLignebudgetaireId(String lignebudgetaireId);
}

// LiquidationRepository.java
@Repository
public interface LiquidationRepository extends JpaRepository<Liquidation, String> {
    List<Liquidation> findByEngagementId(String engagementId);
    List<Liquidation> findByEngagementIdAndEtat(String engagementId, Liquidation.EtatLiquidation etat);
    boolean existsByNumeroFacture(String numeroFacture);
}

// MandatRepository.java
@Repository
public interface MandatRepository extends JpaRepository<Mandat, String> {
    List<Mandat> findByOrdonnatorId(UUID ordonnatorId);
    List<Mandat> findByEtat(Mandat.EtatMandat etat);
}

// PaiementRepository.java
@Repository
public interface PaiementRepository extends JpaRepository<Paiement, String> {
    Optional<Paiement> findByMandatId(UUID mandatId);
    List<Paiement> findByReceveId(String receveId);
}

// Regularisation470XXRepository.java
@Repository
public interface Regularisation470XXRepository extends JpaRepository<Regularisation470XX, String> {
    List<Regularisation470XX> findByEtat(Regularisation470XX.EtatRegularisation etat);
    List<Regularisation470XX> findByReceveId(String receveId);
}

// RegieAvancesRepository.java
@Repository
public interface RegieAvancesRepository extends JpaRepository<RegieAvances, String> {
    List<RegieAvances> findByRegisseurIdAndEtat(String regisseurId, RegieAvances.EtatRegie etat);
    List<RegieAvances> findByRegieClotureExerciceFalse();
}
*/

// ========================================
// 3. CONFIGURATION FRONTEND (React + TypeScript)
// ========================================

/**
 * INSTALLATION DES DÉPENDANCES
 * 
 * npm install
 * npm install axios
 * npm install react-router-dom
 * npm install @tanstack/react-query
 * npm install zustand (pour état global)
 * npm install react-hot-toast (pour notifications)
 */

/**
 * FICHIERS DE CONFIGURATION À CRÉER
 */

// vite.config.ts
// Ajouter proxy pour l'API
// proxy: {
//   '/api': {
//     target: 'http://192.168.68.122:8080',
//     changeOrigin: true,
//     rewrite: (path) => path.replace(/^\/api/, ''),
//   }
// }

// .env.local
// VITE_API_BASE_URL=http://192.168.68.122:8080/api/v1
// VITE_KEYCLOAK_URL=https://keycloak-server
// VITE_KEYCLOAK_REALM=simba-ctd

// ========================================
// 4. INTÉGRATION DANS L'INTERFACE UTILISATEUR
// ========================================

/**
 * EXEMPLE D'UTILISATION DANS UN COMPOSANT EXISTANT
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth'; // Hook authentification Keycloak
import { engagementApi, liquidationApi } from '@/api/budget.api';
import { Engagement, TypeEngagement } from '@/types/budget';

export const AdminBudgetPage = () => {
  const { user } = useAuth(); // Info utilisateur authentifié
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger les engagements de l'ordonnateur actuel
    if (user?.id) {
      loadEngagements();
    }
  }, [user]);

  const loadEngagements = async () => {
    try {
      setLoading(true);
      const data = await engagementApi.listerEngagementsOrdonnateur(user?.id!);
      setEngagements(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1>Gestion des Engagements Budgétaires</h1>
      {/* Affichage de la liste */}
    </div>
  );
};

// ========================================
// 5. CONTRÔLES MÉTIER À IMPLÉMENTER
// ========================================

/**
 * VÉRIFICATIONS CRITIQUES (À IMPLÉMENTER EN BACKEND)
 * 
 * FC-DEP-001 (Engagement):
 * ✅ RG-DEP-001: Document M5 obligatoire (exception 470XX)
 * ✅ RG-DEP-002: Crédits suffisants - BLOQUANT
 * ✅ RG-DEP-003: Taxes simultanées avec dépense
 * ✅ RG-DEP-004: Délai visa CF: 8 jours ouvrables
 * ✅ RG-DEP-005: Avis DGI obligatoire
 * ✅ RG-DEP-006: Refus CF levable uniquement MINFI
 * ✅ RG-DEP-007: Clôture 30 novembre - BLOQUANT
 * ✅ RG-DEP-008: Ordonnateur accrédité (OP-01)
 * 
 * FC-DEP-002 (Liquidation):
 * ✅ RG-DEP-009: Montant liquidé <= montant engagé
 * ✅ RG-DEP-010: 6 types de factures gérés
 * ✅ RG-DEP-011: Attestation fiscale obligatoire
 * 
 * FC-DEP-003 (Mandat):
 * ✅ RG-DEP-012: 5 types de mandats reconnus
 * ✅ RG-DEP-013: Cachet "DEPENSE VALIDEE" obligatoire
 * ✅ RG-DEP-014: Clôture 31 décembre - BLOQUANT
 * ✅ RG-DEP-015: Écritures comptables générées automatiquement
 * 
 * FC-DEP-004 (Paiement):
 * ✅ RG-DEP-016: Seuil caisse/banque 100 000 FCFA
 * ✅ RG-DEP-017: Double signature >= 100 000 FCFA
 * ✅ RG-DEP-018: Retenue source automatique
 * ✅ RG-DEP-019: Clôture 31 janvier N+1 - BLOQUANT
 * ✅ RG-DEP-020: Programmation dans plan trésorerie
 * 
 * FC-DEP-005 (Régularisation 470XX):
 * ✅ RG-DEP-021: Délai régularisation 30 jours - BLOQUANT
 * ✅ RG-DEP-022: Alertes J+15, J+25 automatiques
 * ✅ RG-DEP-023: Signature ordonnateur obligatoire
 * ✅ RG-DEP-024: Contrepassation 470XX automatique
 * 
 * FC-DEP-006 (Régie d'avances):
 * ✅ RG-DEP-025: Plafond autorisé - dépassement BLOQUANT
 * ✅ RG-DEP-026: Nature limitée aux catégories autorisées
 * ✅ RG-DEP-027: Apurement trimestriel/semestriel obligatoire
 * ✅ RG-DEP-028: Clôture fin d'exercice avec reversement
 */

/**
 * CLASSE D'ASPECT POUR IMPLÉMENTER LES CONTRÔLES
 */
/*
@Aspect
@Component
public class BudgetRulesAspect {
    
    @Before("@annotation(com.simba.ctd.budget.annotations.ValidateRule)")
    public void validateBudgetRules(JoinPoint joinPoint) throws Throwable {
        // Validation RG-DEP-001: Document M5 obligatoire
        // Validation RG-DEP-002: Crédits suffisants
        // Validation RG-DEP-007: Clôture 30 novembre
        // etc.
    }
    
    @Around("@annotation(com.simba.ctd.budget.annotations.AuditLogging)")
    public Object auditLog(ProceedingJoinPoint joinPoint) throws Throwable {
        // Trace d'audit: qui, quoi, quand
        LocalDateTime timestamp = LocalDateTime.now();
        String action = joinPoint.getSignature().getName();
        Object result = joinPoint.proceed();
        // Enregistrer dans table audit
        return result;
    }
}
*/

// ========================================
// 6. NOTIFICATIONS ET ALERTES
// ========================================

/**
 * SERVICE POUR GÉRER LES ALERTES AUTOMATIQUES
 * 
 * À implémenter:
 * - Alertes clôture 30 novembre (engagements)
 * - Alertes clôture 31 décembre (mandats)
 * - Alertes clôture 31 janvier (paiements)
 * - Alertes J+15, J+25 (régularisations 470XX)
 * - Alertes fin d'exercice (régies)
 * 
 * Mécanisme:
 * - Job schedulé (Spring Scheduler ou Quartz)
 * - Vérification quotidienne des délais
 * - Notifications email/SMS aux acteurs concernés
 * - Traçabilité dans base de données
 */

/**
 * @Scheduled(cron = "0 0 * * * *") // Tous les jours à minuit
 * public void verifierAletesAutomatiques() {
 *     // Vérifier tous les délais critiques
 *     regularisation470XXService.gererAlertesAutomatiques();
 *     regieAvancesService.gererAlertesClotureExercice();
 *     // etc.
 * }
 */

// ========================================
// 7. TABLES D'AUDIT ET TRAÇABILITÉ
// ========================================

/**
 * TABLE AUDIT
 * 
 * CREATE TABLE audit_trails (
 *     id UUID PRIMARY KEY,
 *     action VARCHAR(255) NOT NULL,
 *     entity_type VARCHAR(255) NOT NULL,
 *     entity_id UUID NOT NULL,
 *     user_id VARCHAR(255) NOT NULL,
 *     old_value TEXT,
 *     new_value TEXT,
 *     timestamp TIMESTAMP NOT NULL,
 *     ip_address VARCHAR(45),
 *     user_agent TEXT
 * );
 * 
 * Exemples:
 * - Création engagement
 * - Modification état
 * - Visa CF
 * - Rejet CF avec motif
 * - Tentative de contournement
 */

// ========================================
// 8. DÉPLOIEMENT ET EXÉCUTION
// ========================================

/**
 * DÉMARRAGE DES SERVICES
 * 
 * Backend:
 * mvn clean install
 * java -jar target/simba-ctd-backend.jar
 * 
 * Frontend:
 * npm run dev
 * Accès: http://192.168.68.122:5173
 * 
 * Base de données (PostgreSQL):
 * docker-compose -f docker-compose.yaml up
 * 
 * Keycloak (Authentification):
 * docker pull keycloak/keycloak:latest
 * docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin keycloak/keycloak:latest start-dev
 */

// ========================================
// 9. POINTS D'EXTENSION
// ========================================

/**
 * Le système est conçu pour être extensible:
 * 
 * 1. Intégration comptable:
 *    - Génération automatique des écritures (RG-DEP-015)
 *    - Export vers ERP
 * 
 * 2. Paiements:
 *    - Intégration passerelle bancaire
 *    - Notifications tiers (SMS/Email)
 * 
 * 3. Rapports:
 *    - Tableaux de bord (Dashboard)
 *    - Exports PDF
 *    - Statistiques mensuelles/annuelles
 * 
 * 4. Intégrations externes:
 *    - API tiers (maires, banques)
 *    - Flux EDI
 *    - Web services
 */

// ========================================
// 10. SUPPORT ET MAINTENANCE
// ========================================

/**
 * LOGS ET DEBUGGING
 * 
 * Activer les logs DEBUG en développement:
 * logging.level.com.simba.ctd=DEBUG
 * logging.level.org.springframework.security=DEBUG
 * 
 * Fichiers logs:
 * logs/application.log
 * logs/audit.log
 * logs/errors.log
 * 
 * Métriques (Actuator):
 * GET http://192.168.68.122:8080/actuator/health
 * GET http://192.168.68.122:8080/actuator/metrics
 */

export const DEPLOYMENT_GUIDE = {
  backend: {
    build: 'mvn clean install',
    run: 'java -jar target/simba-ctd-backend.jar',
    port: 8080,
  },
  frontend: {
    install: 'npm install',
    dev: 'npm run dev',
    build: 'npm run build',
    port: 5173,
  },
  database: {
    engine: 'PostgreSQL',
    command: 'docker-compose -f docker-compose.yaml up',
  },
  auth: {
    provider: 'Keycloak',
    realm: 'simba-ctd',
    documentation: 'https://www.keycloak.org/documentation.html',
  },
};

export const IMPLEMENTATION_CHECKLIST = [
  '✅ Modèles JPA créés pour les 6 processus',
  '✅ Services métier implémentés',
  '✅ Repositories JPA créés',
  '✅ API REST créée',
  '⏳ Contrôleurs Spring Boot à créer',
  '⏳ Tests unitaires à écrire',
  '⏳ Tests d\'intégration à écrire',
  '⏳ Composants React à développer',
  '⏳ Authentification Keycloak à intégrer',
  '⏳ Tableau de bord/Analytics à créer',
  '⏳ Export PDF/Excel à implémenter',
  '⏳ Notifications Email/SMS à implémenter',
  '⏳ Intégration comptable à faire',
];
