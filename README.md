# 📊 SIMBA-CTD : Système de Gestion Budgétaire

## 🎯 Objectif du Projet

SIMBA-CTD est une application complète de gestion budgétaire destinée aux **collectivités territoriales décentralisées** (CTD). Elle implémente l'intégralité du circuit **ELOP** (Engagement, Liquidation, Ordonnancement, Paiement) des dépenses budgétaires avec tous les contrôles métier requis.

## 📋 Vue d'Ensemble

### Les 6 Processus Métier (FC-DEP-001 à FC-DEP-006)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX ELOP COMPLET                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FC-DEP-001           FC-DEP-002          FC-DEP-003        │
│  ENGAGEMENT           LIQUIDATION        ORDONNANCEMENT      │
│  ┌──────────┐        ┌──────────┐       ┌──────────┐        │
│  │ Créer    │──M5──▶│ Service  │──Fact▶│ Mandat   │        │
│  │ Engagement│       │ Fait OK  │       │ Crédits  │        │
│  │ Document │        │ Factures │       │ + Visa CF│        │
│  └──────────┘        └──────────┘       └──────────┘        │
│       │                   │                   │              │
│  Crédits OK      Montant  OK         Cachet OK  │              │
│  Taxes calc.     Fiscalité OK        Entrées GL │              │
│  Rés. crédits    Types fact.         Trésor.    │              │
│       │                   │                   │              │
│  ────────────────────────────────────────────│              │
│                                               │              │
│                              FC-DEP-004  FC-DEP-005  FC-DEP-006
│                              PAIEMENT    470XX       RÉGIES
│                              ┌────────┐  ┌──────┐  ┌────────┐
│                              │Receveur│  │Détect│  │Avances │
│                              │Vérifie │  │Bank  │  │Régisseur
│                              │Mode    │  │30j   │  │Apurement
│                              │Sig     │  │Alerte│  │Exercice│
│                              │Paiement│  │Auto  │  └────────┘
│                              └────────┘  └──────┘
│
└─────────────────────────────────────────────────────────────┘
```

### Les 28 Règles Métier (RG-DEP-001 à RG-DEP-028)

| Numéro | Description | Criticité | Implémenté |
|--------|-------------|-----------|-----------|
| RG-DEP-001 | Document M5 obligatoire | 🔴 BLOQUANT | ✅ |
| RG-DEP-002 | Crédits suffisants | 🔴 BLOQUANT | ✅ |
| RG-DEP-003 | Taxes simultanées | 🟡 INFO | ✅ |
| RG-DEP-007 | Clôture 30 novembre | 🔴 BLOQUANT | ✅ |
| RG-DEP-021 | Délai régularisation 30j | 🔴 BLOQUANT | ✅ |
| RG-DEP-025 | Plafond régie | 🔴 BLOQUANT | ✅ |
| ... | Voir page 3 pour la liste complète | | ✅ |

## 🏗️ Architecture Technique

### Stack Technologique

```
FRONTEND                          BACKEND
┌──────────────────────┐         ┌──────────────────────┐
│ React 18 + TypeScript│         │ Spring Boot 3.x      │
│ Vite (Build)         │◄────────│ Java 17+             │
│ TailwindCSS          │ REST API│ PostgreSQL Driver    │
│ Shadcn/ui Components │         │ Keycloak Spring Sec  │
│ Keycloak Auth        │         │ Lombok/MapStruct    │
└──────────────────────┘         └──────────────────────┘
         │                                │
         └────────────────┬───────────────┘
                          │
                    ┌─────▼──────┐
                    │ PostgreSQL  │
                    │ Docker Comp.│
                    └─────┬───────┘
                          │
                    ┌─────▼──────┐
                    │ Keycloak    │
                    │ (Auth IDP)  │
                    └─────────────┘
```

## 📁 Structure du Projet

```
Simba_CTD/
├── src/
│   ├── main/
│   │   ├── java/com/simba/ctd/
│   │   │   ├── budget/
│   │   │   │   ├── model/               # Entités JPA
│   │   │   │   │   ├── Engagement.java
│   │   │   │   │   ├── Liquidation.java
│   │   │   │   │   ├── Mandat.java
│   │   │   │   │   ├── Paiement.java
│   │   │   │   │   ├── Regularisation470XX.java
│   │   │   │   │   └── RegieAvances.java
│   │   │   │   ├── service/             # Services métier
│   │   │   │   │   ├── EngagementService.java
│   │   │   │   │   ├── BudgetServices.java
│   │   │   │   │   └── RegieAvancesService.java
│   │   │   │   ├── repository/          # Repositories JPA
│   │   │   │   │   ├── EngagementRepository.java
│   │   │   │   │   ├── LiquidationRepository.java
│   │   │   │   │   └── ...
│   │   │   │   ├── controller/          # Contrôleurs REST
│   │   │   │   │   ├── EngagementController.java
│   │   │   │   │   ├── BudgetController.java
│   │   │   │   │   └── ...
│   │   │   │   ├── exception/           # Exceptions métier
│   │   │   │   └── dto/                 # DTOs pour API
│   │   │   └── common/
│   │   │       ├── auth/
│   │   │       ├── security/
│   │   │       └── utils/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/            # Scripts Flyway
│   └── test/                            # Tests JUnit
└── docker-compose.yaml                  # PostgreSQL + Keycloak

frontend/
├── src/
│   ├── api/
│   │   ├── budget.api.ts                # Services API REST
│   │   ├── auth.api.ts
│   │   └── axios.tsx                    # Client HTTP
│   ├── components/
│   │   ├── budget/
│   │   │   ├── FluxELOPComponent.tsx    # Exemple complet
│   │   │   ├── EngagementForm.tsx
│   │   │   ├── LiquidationForm.tsx
│   │   │   ├── MandatList.tsx
│   │   │   ├── PaiementForm.tsx
│   │   │   └── DashboardBudget.tsx
│   │   ├── admin/                       # Composants admin
│   │   └── ui/                          # Shadcn/ui
│   ├── types/
│   │   └── budget.ts                    # Types TypeScript
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   ├── keycloak.ts
│   │   └── useAuth.ts
│   ├── lib/
│   │   └── nav.ts                       # Navigation/routes
│   └── App.tsx
└── package.json
```

## 🚀 Démarrage Rapide

### 1️⃣ Prérequis

- **Node.js** 18+ et npm 9+
- **Java** 17+ et Maven 3.8+
- **PostgreSQL** 14+
- **Docker** et Docker Compose
- **Keycloak** (fourni en Docker)

### 2️⃣ Démarrage de l'Environnement

```bash
# Démarrer PostgreSQL et Keycloak
docker-compose -f Simba_CTD/docker-compose.yaml up -d

# Vérifier que les services sont prêts
docker-compose ps
# → postgres: up, keycloak: up
```

### 3️⃣ Démarrage du Backend

```bash
cd Simba_CTD

# Compiler le projet
mvn clean install

# Lancer le serveur
java -jar target/simba-ctd-backend.jar

# Ou avec Maven
mvn spring-boot:run

# ✅ Backend accessible sur http://192.168.68.122:8080
```

### 4️⃣ Démarrage du Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# ✅ Frontend accessible sur http://192.168.68.122:5173
```

### 5️⃣ Configuration Keycloak (Une fois seulement)

1. Accédez à http://192.168.68.122:8080/admin
2. Identifiants: `admin` / `admin`
3. Créez un realm `simba-ctd`
4. Créez un client `simba-ctd-api` avec les rôles:
   - `ORDONNATEUR`
   - `CONTROLEUR_FINANCIER`
   - `RECEVEUR`
   - `REGISSEUR`
   - `ADMIN`

## 💻 Utilisation

### Exemple 1: Créer un Engagement Budgétaire

```typescript
import { engagementApi } from '@/api/budget.api';

// Créer un engagement
const engagement = await engagementApi.creerEngagement(
  'DOC-M5-2024-001', // Document M5
  'ORD-001'          // ID Ordonnateur
);

// Valider et réserver les crédits
await engagementApi.validerEtRéserverCrédits(engagement.id);

// Soumettre au CF
await engagementApi.soumettreAuControllerFinancier(
  engagement.id,
  'CF-001'
);

// Apposer visa
const updated = await engagementApi.apposeVisaCF(
  engagement.id,
  'CF-001',
  'VISA' // ou REJET, OBSERVATIONS, RESERVES
);

// Confirmer (génère numéro unique)
const confirmed = await engagementApi.confirmerEngagement(engagement.id);
console.log('Numéro:', confirmed.numeroEngagement); // ENG-2024-001-WAT-UTC
```

### Exemple 2: Effectuer un Paiement

```typescript
import { paiementApi } from '@/api/budget.api';

// Créer instruction de paiement
const paiement = await paiementApi.creerInstructionPaiement(
  'MANDAT-001',
  'RECEVEUR-001'
);

// Effectuer vérifications
await paiementApi.effectuerVerifications(paiement.id, {
  validiteCreance: true,
  prescriptionOK: true,
  pasOppositions: true,
  redevabiliteOK: true
});

// Déterminer mode paiement (auto selon montant)
// Seuil 100 000 FCFA = caisse, sinon banque
await paiementApi.determinierModePaiementEtCachet(
  paiement.id,
  false  // pas investissement
);

// Signature Receveur
await paiementApi.enregistrerSignatureReceveur(paiement.id);

// Signature Cosignataire (si montant >= 100K)
if (paiement.modePaiement === 'CHEQUE' && paiement.montantTTC >= 100000) {
  await paiementApi.enregistrerSignatureCosignataire(
    paiement.id,
    'COSIGNATAIRE-001'
  );
}

// Effectuer le paiement
const paye = await paiementApi.effectuerPaiement(paiement.id);
console.log('✅ Paiement effectué:', paye.montantNAPVerse, 'FCFA');
```

## 🔐 Sécurité et Rôles

Le système implémente un contrôle d'accès basé sur les rôles (RBAC):

| Rôle | Permissions |
|------|------------|
| **ORDONNATEUR** | Créer engagements, mandats, visualiser ses données |
| **CONTROLEUR_FINANCIER** | Valider engagements/liquidations, apposer visa et cachet |
| **RECEVEUR** | Créer paiements, effectuer vérifications, traiter chèques |
| **REGISSEUR** | Gérer régies d'avances, apurements |
| **ADMIN** | Accès complet, configuration système |

## 📊 Composants React Prêts à Développer

### 1. Tableau de Bord (DashboardBudget)
- Résumé des engagements par état
- Flux liquidations/mandats/paiements
- Alertes clôtures (30 nov, 31 déc, 31 jan, etc.)
- Statistiques mensuelles

### 2. Formulaire Engagement (EngagementForm)
- Sélection document M5
- Auto-remplissage (montant, fournisseur, etc.)
- Calcul automatique taxes
- Bouton confirmation avec visa CF

### 3. Gestion Liquidations (LiquidationForm)
- Enregistrement facture (6 types)
- Upload fichiers justificatifs
- Affichage montants (HT, TVA, TTC)
- Soumission CF

### 4. Liste Mandats (MandatList)
- Filtres par état, ordonnateur, date
- Actions: visa CF, cachet, transmission
- Détails mandat avec engagements liés

### 5. Paiement (PaiementForm)
- Vérifications (créance, prescription, opposition)
- Auto-détection mode paiement
- Signatures (1 ou 2)
- Historique des paiements

### 6. Régularisations 470XX (Regularisation470XXList)
- Détections automatiques
- Status alertes (J+15, J+25)
- Actions: créer engagement, contrepassation
- Audit trail

### 7. Gestion Régies (RegieAvancesManagement)
- Créer regie (avec plafond)
- Ajouter dépenses (nature validée)
- Uploads justificatifs
- Apurement trimestriel/semestriel
- Clôture exercice

## 📝 Règles Métier Codées

Toutes les 28 règles métier sont implémentées au niveau service:

```java
// Exemple: Vérification crédits (RG-DEP-002)
@Transactional
public Engagement validerEtRéserverCrédits(String engagementId) {
    Engagement eng = getEngagementCourant(engagementId).orElseThrow();
    
    // BLOQUANT: Crédits suffisants
    if (eng.montantTTC > eng.lignebudgetaire.creditDisponible) {
        throw new BusinessException(
            "Crédits insuffisants: " + 
            "demandé=" + eng.montantTTC + 
            ", disponible=" + eng.lignebudgetaire.creditDisponible
        );
    }
    
    // Réserver les crédits (UPDLOCK)
    eng.lignebudgetaire.creditDisponible -= eng.montantTTC;
    eng.lignebudgetaire.creditRéservé += eng.montantTTC;
    
    eng.etat = EtatEngagement.SOUMIS_CF;
    return engagementRepository.save(eng);
}
```

## 🧪 Tests

```bash
# Tests unitaires
mvn test

# Tests d'intégration
mvn verify

# Couverture de code
mvn jacoco:report
```

## 📚 Documentation Complémentaire

- **PDF original**: `Execution_Budgetaire_Depenses.pdf`
- **Guide API**: `GUIDE_CONFIGURATION.ts`
- **Architecture**: `architecture.md` (à créer)
- **Workflows**: `workflows.md` (à créer)

## 🤝 Support et Contribution

Pour toute question ou amélioration, consultez:

1. Le `GUIDE_CONFIGURATION.ts` pour la configuration
2. Les commentaires en français dans le code source
3. La documentation Keycloak pour l'authentification
4. Les logs applicatifs dans `logs/application.log`

## 📋 Checklist Implémentation

- ✅ Modèles JPA (9 classes)
- ✅ Services métier (6 classes, 50+ méthodes)
- ✅ Types TypeScript (10 interfaces + 9 enums)
- ✅ Services API REST (7 objets API, 41+ méthodes)
- ✅ Exemple composant React (FluxELOPComponent)
- ⏳ Repositories JPA
- ⏳ Contrôleurs Spring REST
- ⏳ Autres composants React
- ⏳ Tests unitaires et d'intégration
- ⏳ Tableau de bord/Statistiques
- ⏳ Exports PDF/Excel
- ⏳ Notifications Email/SMS

---

**Version**: 1.0  
**Dernière mise à jour**: 2024  
**Auteur**: Équipe SIMBA  
**Licence**: À définir
