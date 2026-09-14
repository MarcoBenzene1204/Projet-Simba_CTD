// ========================================
// TYPES TYPESCRIPT - Budget & Dépenses
// ========================================

/**
 * Types pour FC-DEP-001: Engagement budgétaire
 */
export enum TypeEngagement {
  BON_DE_COMMANDE = "BON_DE_COMMANDE",
  LETTRE_DE_COMMANDE = "LETTRE_DE_COMMANDE",
  MARCHE = "MARCHE",
  PROVISIONNEL = "PROVISIONNEL"
}

export enum EtatEngagement {
  BROUILLON = "BROUILLON",
  SOUMIS_CF = "SOUMIS_CF",
  VISE = "VISE",
  REJET = "REJET",
  CONFIRME = "CONFIRME",
  CLOTURE_30_NOV = "CLOTURE_30_NOV"
}

export interface Engagement {
  id: string;
  numeroEngagement: string;
  dateEngagement: Date;
  typeEngagement: TypeEngagement;
  objet: string;
  documentM5Id: string;
  ordonnatorId: string;
  controllerFinancierVisaId?: string;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  tauxImpot: number;
  montantImpot: number;
  lignebudgetaireId: string;
  etat: EtatEngagement;
  periodicite?: string;
  contratServiceId?: string;
  dateCreation: Date;
  dateVisa?: Date;
  motifRejet?: string;
  depassementCreditAutorise?: boolean;
  creditsReserves: boolean;
}

/**
 * Types pour FC-DEP-002: Liquidation
 */
export enum TypeFacture {
  COMPLETE = "COMPLETE",
  PARTIELLE = "PARTIELLE",
  PRO_FORMA = "PRO_FORMA",
  AVOIR = "AVOIR",
  RECTIFICATIVE = "RECTIFICATIVE",
  REGULARISATION = "REGULARISATION"
}

export enum EtatLiquidation {
  BROUILLON = "BROUILLON",
  SOUMISE_CF = "SOUMISE_CF",
  VALIDEE_CF = "VALIDEE_CF",
  REJETEE = "REJETEE",
  PRETE_ORDONNANCEMENT = "PRETE_ORDONNANCEMENT"
}

export interface Liquidation {
  id: string;
  engagementId: string;
  typeFacture: TypeFacture;
  numeroFacture: string;
  dateFacture: Date;
  montantHTLiquide: number;
  tauxTVA: number;
  montantTVALiquide: number;
  montantTTCLiquide: number;
  tauxImpotRetenue: number;
  montantImpotRetenue: number;
  montantNAP: number;
  detailPrestations?: string;
  serviceFaitAteste: boolean;
  agentServiceFaitId?: string;
  dateAtestationServiceFait?: Date;
  attestationFiscalePresente: boolean;
  urlAttestationFiscale?: string;
  urlFacture?: string;
  etat: EtatLiquidation;
  dateCreation: Date;
  dateValidation?: Date;
  ordonnatorId?: string;
  controllerFinancierValidationId?: string;
}

/**
 * Types pour FC-DEP-003: Mandat
 */
export enum TypeMandat {
  INDIVIDUEL = "INDIVIDUEL",
  COLLECTIF = "COLLECTIF",
  REGULARISATION = "REGULARISATION",
  RETENUE_GARANTIE = "RETENUE_GARANTIE",
  REGLEMENT_OFFICE = "REGLEMENT_OFFICE"
}

export enum EtatMandat {
  BROUILLON = "BROUILLON",
  SOUMIS_CF = "SOUMIS_CF",
  VISE_CF = "VISE_CF",
  TRANSMIS_RECEVEUR = "TRANSMIS_RECEVEUR",
  REJET_CF = "REJET_CF"
}

export enum EtatPaiement {
  EN_ATTENTE = "EN_ATTENTE",
  PROGRAMME = "PROGRAMME",
  EN_COURS = "EN_COURS",
  EFFECTUE = "EFFECTUE",
  ECHEC = "ECHEC"
}

export enum ModePaiement {
  CAISSE = "CAISSE",
  CHEQUE = "CHEQUE",
  VIREMENT_BANCAIRE = "VIREMENT_BANCAIRE"
}

export interface Mandat {
  id: string;
  numeroMandat: string;
  dateMandat: Date;
  typeMandat: TypeMandat;
  engagementId: string;
  periodeVersement?: string;
  montantTTCMandate: number;
  montantRetenuSource?: number;
  montantNAP: number;
  ordonnatorId: string;
  controllerFinancierVisaId?: string;
  receveId?: string;
  cosignataiderId?: string;
  etat: EtatMandat;
  depenseValideeSignal: boolean;
  dateValiCF?: Date;
  modePaiement?: ModePaiement;
  dateCreation: Date;
  dateSoumissionCF?: Date;
  dateTransmissionReceveur?: Date;
  urlLiasseDocuments?: string;
  urlBordereauMandats?: string;
  etatPaiement: EtatPaiement;
  datePaiement?: Date;
  numeroCheckPaiement?: string;
}

/**
 * Types pour FC-DEP-004: Paiement
 */
export interface Paiement {
  id: string;
  mandatId: string;
  receveId: string;
  cosignataiderId?: string;
  dateReceptionMandat: Date;
  dateProgrammationPaiement?: Date;
  datePaiement?: Date;
  validitCreanceVerifiee: boolean;
  prescriptionVerifiee: boolean;
  oppositionsVerifiees: boolean;
  redevabiliteVerifiee: boolean;
  cachetVuBonAPayer: boolean;
  dateAppositionCachet?: Date;
  montantTTCPaye: number;
  montantRetenuSource: number;
  montantNAPVerse: number;
  disponibilitesCaisse?: number;
  disponibilitesBanque?: number;
  disponibilitesSuffisantes?: boolean;
  justificationDifferement?: string;
  dateSignatureReceveur?: Date;
  dateSignatureCosignataire?: Date;
  signatureReceveEffectuee: boolean;
  signatureCosignatireEffectuee?: boolean;
  ordreVirementGenere?: string;
  numeroCheque?: string;
  etat: EtatPaiement;
  dateCreation: Date;
  motifEchec?: string;
}

/**
 * Types pour FC-DEP-005: Régularisation 470XX
 */
export enum EtatRegularisation {
  DETECTEE = "DETECTEE",
  NOTIFIEE = "NOTIFIEE",
  ENGAGEMENT_CREE = "ENGAGEMENT_CREE",
  SOUMIS_CF = "SOUMIS_CF",
  VISE_CF = "VISE_CF",
  REJET_CF = "REJET_CF",
  LIQUIDEE = "LIQUIDEE",
  MANDATEE = "MANDATEE",
  CONTREPASSEE = "CONTREPASSEE",
  REGULIERISEE = "REGULIERISEE",
  DEPASSEMENT_DELAI = "DEPASSEMENT_DELAI"
}

export interface Regularisation470XX {
  id: string;
  dateDetection: Date;
  referencePaiementDetecte: string;
  engagementRetrospectifId?: string;
  montantDetecte: number;
  montantImputation: number;
  natureDépense: string;
  description?: string;
  receveId: string;
  ordonnatorId: string;
  controllerFinancierVisaId?: string;
  etat: EtatRegularisation;
  comptabiliseeCompte470XX: boolean;
  numeroEcritureComptable470XX?: string;
  dateNotificationOrdonnateur?: Date;
  ordonnatorNotifie: boolean;
  dateCreationEngagement?: Date;
  dateVisaCF?: Date;
  delaiVisaCF?: number;
  mandatRegularisationId?: string;
  contrepassation470XXAutoeffectuee: boolean;
  numeroEcritureContrepassation?: string;
  dateEcheanceRegularisation: Date;
  alerteJ15Declenchee?: boolean;
  alerteJ25Declenchee?: boolean;
  alerteCritique?: boolean;
  dateCreation: Date;
  motifRejetCF?: string;
  inscritRegistreAnomalies?: boolean;
  notificationTutelleEnvoyee?: boolean;
}

/**
 * Types pour FC-DEP-006: Régie d'avances
 */
export enum EtatRegie {
  ACTIVE = "ACTIVE",
  EN_APUREMENT = "EN_APUREMENT",
  SUSPENDUE = "SUSPENDUE",
  CLOTUREEXERCICE = "CLOTUREEXERCICE",
  FERMEE = "FERMEE"
}

export enum PeriodiciteApurement {
  TRIMESTRIELLE = "TRIMESTRIELLE",
  SEMESTRIELLE = "SEMESTRIELLE"
}

export interface RegieAvances {
  id: string;
  numeroRegie: string;
  dateCreation: Date;
  periodicite: PeriodiciteApurement;
  regisseurId: string;
  numeroDélibération: string;
  dateDélibération: Date;
  dateApprovalDélibération: Date;
  montantPlafond: number;
  montantTotal: number;
  montantEngages: number;
  montantAutorises: number;
  montantOrdonnances: number;
  montantPaye: number;
  soldeDisponible: number;
  naturesAutorisees: string;
  etat: EtatRegie;
  apurements?: ApurementRegie[];
  dépenses?: DépenseRegie[];
  montantDernierReconstitution?: number;
  dateDernierReconstitution?: Date;
  regieClotureExercice?: boolean;
  dateClotureExercice?: Date;
  soldeReversement?: number;
  dateReversementEffectuee?: Date;
  dateModification: Date;
}

export interface DépenseRegie {
  id: string;
  regieId: string;
  nature: string;
  montant: number;
  dateDepense: Date;
  description?: string;
  urlJustificatifs?: string;
  etat: "SAISIE" | "VALIDEE" | "AUTORISEE" | "ORDONNANCEE" | "PAYEE";
}

export interface ApurementRegie {
  id: string;
  regieId: string;
  datePeriode: Date;
  montantSoumis: number;
  controllerFinancierVisaId?: string;
  dateVisaCF?: Date;
  etat: "EN_COURS" | "VISEE_CF" | "ORDONNANCEE" | "PAYEE";
}

/**
 * Types généraux et réponses API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface BudgetSummary {
  totalEngagements: number;
  totalLiquidations: number;
  totalMandats: number;
  totalPayements: number;
  montantEngages: number;
  montantLiquide: number;
  montantMandate: number;
  montantPaye: number;
}
