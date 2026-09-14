// ========================================
// SERVICES API - Budget & Dépenses
// ========================================

import apiClient from "./axios";
import type {
  Engagement,
  Liquidation,
  Mandat,
  Paiement,
  Regularisation470XX,
  RegieAvances,
  DépenseRegie,
  ApurementRegie,
  ApiResponse,
  PaginatedResponse,
  BudgetSummary
} from "@/types/budget";

const BASE_URL = "/api/v1/budget";

/**
 * Service API pour les engagements budgétaires (FC-DEP-001)
 * 
 * Endpoints:
 * - POST /engagements - Créer engagement
 * - GET /engagements/:id - Récupérer engagement
 * - GET /engagements - Lister les engagements
 * - PUT /engagements/:id/valider - Valider et réserver crédits
 * - PUT /engagements/:id/soumettre-cf - Soumettre au CF
 * - PUT /engagements/:id/apposevisacf - Apposer visa CF
 * - PUT /engagements/:id/confirmer - Confirmer engagement
 */
export const engagementApi = {
  /**
   * Crée un nouvel engagement budgétaire
   * Règle métier: RG-DEP-001 - Document M5 obligatoire
   */
  creerEngagement: async (documentM5Id: string, ordonnatorId: string) => {
    const response = await apiClient.post<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements`,
      { documentM5Id, ordonnatorId }
    );
    return response.data.data;
  },

  /**
   * Récupère un engagement par son ID
   */
  obtenirEngagement: async (engagementId: string) => {
    const response = await apiClient.get<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements/${engagementId}`
    );
    return response.data.data;
  },

  /**
   * Liste les engagements avec pagination
   */
  listerEngagements: async (page: number = 0, size: number = 20) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Engagement>>
    >(`${BASE_URL}/engagements`, {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Liste les engagements d'un ordonnateur
   */
  listerEngagementsOrdonnateur: async (ordonnatorId: string) => {
    const response = await apiClient.get<ApiResponse<Engagement[]>>(
      `${BASE_URL}/engagements/ordonnateur/${ordonnatorId}`
    );
    return response.data.data;
  },

  /**
   * Valide l'engagement et réserve les crédits
   * Règle métier: RG-DEP-002 - Crédits suffisants
   */
  validerEtRéserverCrédits: async (engagementId: string) => {
    const response = await apiClient.put<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements/${engagementId}/valider`
    );
    return response.data.data;
  },

  /**
   * Soumet l'engagement au Contrôleur Financier
   * Vérification: Avis DGI obligatoire (RG-DEP-005)
   */
  soumettreAuControllerFinancier: async (
    engagementId: string,
    controllerFinancierVisaId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements/${engagementId}/soumettre-cf`,
      { controllerFinancierVisaId }
    );
    return response.data.data;
  },

  /**
   * Appose le visa du Contrôleur Financier
   * Conforme à RG-DEP-006: Refus levable uniquement par autorisation MINFI
   */
  apposeVisaCF: async (
    engagementId: string,
    controllerFinancierVisaId: string,
    typeVisa: "VISA" | "OBSERVATIONS" | "RESERVES" | "REJET",
    motifRejet?: string
  ) => {
    const response = await apiClient.put<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements/${engagementId}/apposevisacf`,
      { controllerFinancierVisaId, typeVisa, motifRejet }
    );
    return response.data.data;
  },

  /**
   * Confirme l'engagement après visa du CF
   * Génère numéro unique avec horodatage WAT UTC+1
   */
  confirmerEngagement: async (engagementId: string) => {
    const response = await apiClient.put<ApiResponse<Engagement>>(
      `${BASE_URL}/engagements/${engagementId}/confirmer`
    );
    return response.data.data;
  }
};

/**
 * Service API pour les liquidations (FC-DEP-002)
 */
export const liquidationApi = {
  /**
   * Crée une nouvelle liquidation
   * Règle métier: RG-DEP-008 - Service fait attesté obligatoire
   */
  creerLiquidation: async (engagementId: string) => {
    const response = await apiClient.post<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations`,
      { engagementId }
    );
    return response.data.data;
  },

  /**
   * Récupère une liquidation par son ID
   */
  obtenirLiquidation: async (liquidationId: string) => {
    const response = await apiClient.get<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}`
    );
    return response.data.data;
  },

  /**
   * Atteste le service fait
   * Attestation numérique obligatoire du service bénéficiaire
   */
  attesterServiceFait: async (
    liquidationId: string,
    agentServiceFaitId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}/attester-service-fait`,
      { agentServiceFaitId }
    );
    return response.data.data;
  },

  /**
   * Enregistre la facture avec détails
   * Types: COMPLETE, PARTIELLE, PRO_FORMA, AVOIR, RECTIFICATIVE, REGULARISATION
   */
  enregistrerFacture: async (
    liquidationId: string,
    data: {
      typeFacture: string;
      numeroFacture: string;
      dateFacture: Date;
      montantHT: number;
      detailPrestations?: string;
    }
  ) => {
    const response = await apiClient.post<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}/enregistrer-facture`,
      data
    );
    return response.data.data;
  },

  /**
   * Soumet la liquidation au Contrôleur Financier
   */
  soumettreAuControllerFinancier: async (liquidationId: string) => {
    const response = await apiClient.put<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}/soumettre-cf`
    );
    return response.data.data;
  },

  /**
   * Valide la liquidation (signature CF)
   */
  validerLiquidation: async (
    liquidationId: string,
    controllerFinancierValidationId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}/valider`,
      { controllerFinancierValidationId }
    );
    return response.data.data;
  },

  /**
   * Prépare pour ordonnancement
   */
  preparerPourOrdonnancement: async (liquidationId: string) => {
    const response = await apiClient.put<ApiResponse<Liquidation>>(
      `${BASE_URL}/liquidations/${liquidationId}/preparer-ordonnancement`
    );
    return response.data.data;
  },

  /**
   * Liste les liquidations d'un engagement
   */
  listerLiquidationsEngagement: async (engagementId: string) => {
    const response = await apiClient.get<ApiResponse<Liquidation[]>>(
      `${BASE_URL}/liquidations/engagement/${engagementId}`
    );
    return response.data.data;
  },

  /**
   * Upload d'un justificatif (facture, attestation fiscale)
   */
  uploadJustificatif: async (
    liquidationId: string,
    typeJustificatif: "facture" | "attestation_fiscale",
    file: File
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeJustificatif", typeJustificatif);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `${BASE_URL}/liquidations/${liquidationId}/upload-justificatif`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
    return response.data.data;
  }
};

/**
 * Service API pour les mandats (FC-DEP-003)
 */
export const mandatApi = {
  /**
   * Crée un nouveau mandat
   * Types: INDIVIDUEL, COLLECTIF, REGULARISATION, RETENUE_GARANTIE, REGLEMENT_OFFICE
   */
  creerMandat: async (
    engagementId: string,
    typeMandat: string,
    ordonnatorId: string
  ) => {
    const response = await apiClient.post<ApiResponse<Mandat>>(
      `${BASE_URL}/mandats`,
      { engagementId, typeMandat, ordonnatorId }
    );
    return response.data.data;
  },

  /**
   * Récupère un mandat par son ID
   */
  obtenirMandat: async (mandatId: string) => {
    const response = await apiClient.get<ApiResponse<Mandat>>(
      `${BASE_URL}/mandats/${mandatId}`
    );
    return response.data.data;
  },

  /**
   * Soumet le mandat au Contrôleur Financier
   */
  soumettreAuControllerFinancier: async (mandatId: string) => {
    const response = await apiClient.put<ApiResponse<Mandat>>(
      `${BASE_URL}/mandats/${mandatId}/soumettre-cf`
    );
    return response.data.data;
  },

  /**
   * Appose le cachet "DEPENSE VALIDEE" du CF
   * Règle métier: RG-DEP-013 - Cachet obligatoire
   */
  apposeVisaCFEtCachet: async (
    mandatId: string,
    controllerFinancierVisaId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Mandat>>(
      `${BASE_URL}/mandats/${mandatId}/appose-visa-cachet`,
      { controllerFinancierVisaId }
    );
    return response.data.data;
  },

  /**
   * Transmet le mandat au Receveur
   * Condition: Cachet "DEPENSE VALIDEE" présent
   * Clôture avant 31 décembre (RG-DEP-014)
   */
  transmettreAuReceveur: async (
    mandatId: string,
    receveId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Mandat>>(
      `${BASE_URL}/mandats/${mandatId}/transmettre-receveur`,
      { receveId }
    );
    return response.data.data;
  }
};

/**
 * Service API pour les paiements (FC-DEP-004)
 */
export const paiementApi = {
  /**
   * Crée une instruction de paiement
   */
  creerInstructionPaiement: async (
    mandatId: string,
    receveId: string
  ) => {
    const response = await apiClient.post<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements`,
      { mandatId, receveId }
    );
    return response.data.data;
  },

  /**
   * Récupère un paiement par son ID
   */
  obtenirPaiement: async (paiementId: string) => {
    const response = await apiClient.get<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}`
    );
    return response.data.data;
  },

  /**
   * Effectue les vérifications requises par le Receveur
   */
  effectuerVerifications: async (
    paiementId: string,
    verifications: {
      validiteCreance: boolean;
      prescriptionOK: boolean;
      pasOppositions: boolean;
      redevabiliteOK: boolean;
    }
  ) => {
    const response = await apiClient.put<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}/verifications`,
      verifications
    );
    return response.data.data;
  },

  /**
   * Détermine le mode de paiement et appose le cachet
   * Règle métier: RG-DEP-016, RG-DEP-017 - Mode selon montant et nature
   */
  determinierModePaiementEtCachet: async (
    paiementId: string,
    investissement: boolean
  ) => {
    const response = await apiClient.put<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}/determiner-mode-paiement`,
      { investissement }
    );
    return response.data.data;
  },

  /**
   * Enregistre la signature du Receveur
   */
  enregistrerSignatureReceveur: async (paiementId: string) => {
    const response = await apiClient.put<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}/signature-receveur`
    );
    return response.data.data;
  },

  /**
   * Enregistre la signature du Cosignataire
   * Obligatoire pour chèques >= 100 000 FCFA (RG-DEP-017)
   */
  enregistrerSignatureCosignataire: async (
    paiementId: string,
    cosignataiderId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}/signature-cosignataire`,
      { cosignataiderId }
    );
    return response.data.data;
  },

  /**
   * Effectue le paiement
   * Règle métier: RG-DEP-019 - Clôture au 31 janvier N+1
   */
  effectuerPaiement: async (paiementId: string) => {
    const response = await apiClient.put<ApiResponse<Paiement>>(
      `${BASE_URL}/paiements/${paiementId}/effectuer`
    );
    return response.data.data;
  }
};

/**
 * Service API pour les régularisations 470XX (FC-DEP-005)
 */
export const regularisation470XXApi = {
  /**
   * Crée une régularisation détectée
   * Détection automatique via rapprochement bancaire
   */
  creerRegularisation: async (
    montantDetecte: number,
    receveId: string,
    natureDépense: string
  ) => {
    const response = await apiClient.post<ApiResponse<Regularisation470XX>>(
      `${BASE_URL}/regularisations-470xx`,
      { montantDetecte, receveId, natureDépense }
    );
    return response.data.data;
  },

  /**
   * Récupère une régularisation par son ID
   */
  obtenirRegularisation: async (regularisationId: string) => {
    const response = await apiClient.get<ApiResponse<Regularisation470XX>>(
      `${BASE_URL}/regularisations-470xx/${regularisationId}`
    );
    return response.data.data;
  },

  /**
   * Notifie l'ordonnateur
   */
  notifierOrdonnateur: async (
    regularisationId: string,
    ordonnatorId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Regularisation470XX>>(
      `${BASE_URL}/regularisations-470xx/${regularisationId}/notifier-ordonnateur`,
      { ordonnatorId }
    );
    return response.data.data;
  },

  /**
   * Crée engagement rétrospectif
   * Conforme à RG-DEP-021: Délai 30 jours
   */
  creerEngagementRetrospectif: async (
    regularisationId: string,
    lignebudgetaireId: string
  ) => {
    const response = await apiClient.put<ApiResponse<Regularisation470XX>>(
      `${BASE_URL}/regularisations-470xx/${regularisationId}/engagement-retrospectif`,
      { lignebudgetaireId }
    );
    return response.data.data;
  },

  /**
   * Effectue la contrepassation 470XX
   * Conforme à RG-DEP-024
   */
  effectuerContrepassation: async (regularisationId: string) => {
    const response = await apiClient.put<ApiResponse<Regularisation470XX>>(
      `${BASE_URL}/regularisations-470xx/${regularisationId}/contrepassation`
    );
    return response.data.data;
  },

  /**
   * Récupère les alertes à traiter
   * Alertes: J+15 (rappel), J+25 (critique)
   */
  obtenirAlertes: async () => {
    const response = await apiClient.get<ApiResponse<Regularisation470XX[]>>(
      `${BASE_URL}/regularisations-470xx/alertes`
    );
    return response.data.data;
  }
};

/**
 * Service API pour les régies d'avances (FC-DEP-006)
 */
export const regieAvancesApi = {
  /**
   * Crée une nouvelle régie d'avances
   * Conditions: Délibération approuvée, régisseur accrédité
   */
  creerRegie: async (
    regisseurId: string,
    montantPlafond: number,
    naturesAutorisees: string,
    numeroDeliberation: string,
    dateDeliberation: Date
  ) => {
    const response = await apiClient.post<ApiResponse<RegieAvances>>(
      `${BASE_URL}/regies-avances`,
      {
        regisseurId,
        montantPlafond,
        naturesAutorisees,
        numeroDeliberation,
        dateDeliberation
      }
    );
    return response.data.data;
  },

  /**
   * Récupère une régie par son ID
   */
  obtenirRegie: async (regieId: string) => {
    const response = await apiClient.get<ApiResponse<RegieAvances>>(
      `${BASE_URL}/regies-avances/${regieId}`
    );
    return response.data.data;
  },

  /**
   * Liste les régies actives du régisseur
   */
  listerRegiesRegisseur: async (regisseurId: string) => {
    const response = await apiClient.get<ApiResponse<RegieAvances[]>>(
      `${BASE_URL}/regies-avances/regisseur/${regisseurId}`
    );
    return response.data.data;
  },

  /**
   * Ajoute une dépense à la régie
   * Règle métier: RG-DEP-025, RG-DEP-026 - Nature autorisée, plafond non dépassé
   */
  ajouterDépense: async (
    regieId: string,
    data: {
      nature: string;
      montant: number;
      description?: string;
    }
  ) => {
    const response = await apiClient.post<ApiResponse<DépenseRegie>>(
      `${BASE_URL}/regies-avances/${regieId}/depenses`,
      data
    );
    return response.data.data;
  },

  /**
   * Joint les justificatifs à une dépense
   */
  joindreJustificatifs: async (
    dépenseId: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `${BASE_URL}/regies-avances/depenses/${dépenseId}/justificatifs`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
    return response.data.data;
  },

  /**
   * Crée un apurement
   * Conforme à RG-DEP-027: Apurement trimestriel/semestriel obligatoire
   */
  creerApurement: async (
    regieId: string,
    datePeriode: Date
  ) => {
    const response = await apiClient.post<ApiResponse<ApurementRegie>>(
      `${BASE_URL}/regies-avances/${regieId}/apurements`,
      { datePeriode }
    );
    return response.data.data;
  },

  /**
   * Appose le visa du CF sur l'apurement
   */
  apporterVisaCFApurement: async (
    apurementId: string,
    controllerFinancierVisaId: string
  ) => {
    const response = await apiClient.put<ApiResponse<ApurementRegie>>(
      `${BASE_URL}/regies-avances/apurements/${apurementId}/visa-cf`,
      { controllerFinancierVisaId }
    );
    return response.data.data;
  },

  /**
   * Reconstitue l'avance
   */
  reconstituerAvance: async (
    regieId: string,
    montantReconstitution: number
  ) => {
    const response = await apiClient.put<ApiResponse<RegieAvances>>(
      `${BASE_URL}/regies-avances/${regieId}/reconstituer`,
      { montantReconstitution }
    );
    return response.data.data;
  },

  /**
   * Clôt la régie en fin d'exercice
   * Conforme à RG-DEP-028
   */
  clotureExercice: async (regieId: string) => {
    const response = await apiClient.put<ApiResponse<RegieAvances>>(
      `${BASE_URL}/regies-avances/${regieId}/cloture-exercice`
    );
    return response.data.data;
  },

  /**
   * Effectue le reversement du solde
   */
  effectuerReversement: async (regieId: string) => {
    const response = await apiClient.put<ApiResponse<RegieAvances>>(
      `${BASE_URL}/regies-avances/${regieId}/reversement`
    );
    return response.data.data;
  }
};

/**
 * Service API pour les dashboards et statistiques
 */
export const budgetDashboardApi = {
  /**
   * Récupère un résumé du budget
   */
  obtenirResume: async (): Promise<BudgetSummary> => {
    const response = await apiClient.get<ApiResponse<BudgetSummary>>(
      `${BASE_URL}/dashboard/resume`
    );
    return response.data.data!;
  },

  /**
   * Récupère les flux par état
   */
  obtenirFluxParEtat: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${BASE_URL}/dashboard/flux-par-etat`
    );
    return response.data.data;
  },

  /**
   * Récupère les alertes (clôtures, délais)
   */
  obtenirAlertes: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${BASE_URL}/dashboard/alertes`
    );
    return response.data.data;
  }
};
