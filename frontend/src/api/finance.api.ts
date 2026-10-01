import api from "./axios";
import type { Engagement } from "@/types/budget";

export interface LiquidationRecord {
  id: string;
  numero: string;
  numeroFacture: string;
  dateFacture: string;
  montantHT: number;
  montantTTC: number;
  montantNAP?: number;
  conformiteFiscale: boolean;
  serviceFaitAt?: string;
  etat: string;
  engagement?: {
    id: string;
    numeroEngagement: string;
  };
}

export interface MandatRecord {
  id: string;
  numeroMandat: string;
  typeMandat: string;
  montantTTCMandate: number;
  etat: string;
  dateMandatement: string;
  numeroBordereau?: string;
}

export interface PaiementRecord {
  id: string;
  numeroPaiement: string;
  modeReglement: string;
  montantTTC: number;
  montantNetPaye: number;
  dateProgrammee?: string;
  dateExecution?: string;
  statut: string;
  referenceBancaire?: string;
  referenceCheque?: string;
  montantRetenues: number;
  cachetVuBonAPayer: boolean;
  receveurSignatureId?: string;
  cosignataireSignatureId?: string;
  doubleSignatureRequise: boolean;
  justificationDifferement?: string;
}

export interface MandatPaiementDisponible {
  id: string;
  numeroMandat: string;
  typeMandat: string;
  montantTTCMandate: number;
  dateMandatement: string;
  doubleSignatureRequise: boolean;
}

export interface PaiementExecutionPayload {
  referenceBancaire?: string;
  referenceCheque?: string;
}

export async function listEngagements(): Promise<Engagement[]> {
  const response = await api.get<Engagement[]>("/engagements");
  return response.data;
}

export interface ExerciceReference {
  id: string;
  annee: number;
  libelle: string;
}

export interface FournisseurReference {
  id: string;
  code?: string;
  nom: string;
  numeroContribuable?: string;
  compteBancaire?: string;
  actif?: boolean;
}

export interface LigneBudgetaireReference {
  id: string;
  code: string;
  libelle: string;
  creditVote?: number;
  creditEngage?: number;
}

export interface DocumentM5Reference {
  id: string;
  reference: string;
  typeDocument: string;
  ligneBudgetaireId?: string;
  tiersId?: string;
  objet?: string;
  montantHT?: number;
  montantTaxes?: number;
  montantTTC?: number;
  montantRestant?: number;
  statut?: string;
}

export interface CreateDocumentM5Payload {
  reference: string;
  typeDocument: string;
  ligneBudgetaireId: string;
  tiersId?: string;
  objet: string;
  montantHT: number;
  montantTaxes: number;
}

export interface CreateTiersPayload {
  code: string;
  raisonSociale: string;
  numeroContribuable?: string;
  compteBancaire?: string;
}

export interface CreateLigneBudgetairePayload {
  exerciceId?: string;
  budgetId?: string;
  code: string;
  libelle: string;
  creditVote?: number;
}

export interface CreateEngagementPayload {
  exerciceId: string;
  ligneBudgetaireId: string;
  tiersId?: string;
  documentM5Id?: string;
  typeEngagement: string;
  objet: string;
  montantHT: number;
  tauxTVA: number;
  tauxImpot: number;
  metadata?: Record<string, unknown>;
}

export async function getExerciceCourant(): Promise<ExerciceReference> {
  const response = await api.get<ExerciceReference>("/referentiels/exercice-courant");
  return response.data;
}

export async function listFournisseurs(): Promise<FournisseurReference[]> {
  const response = await api.get<FournisseurReference[]>("/referentiels/fournisseurs");
  return response.data;
}

export async function listTiers(): Promise<FournisseurReference[]> {
  const response = await api.get<FournisseurReference[]>("/referentiels/tiers");
  return response.data;
}

export async function desactiverTiers(id: string): Promise<FournisseurReference> {
  const response = await api.patch<FournisseurReference>(`/referentiels/tiers/${id}/desactiver`);
  return response.data;
}

export async function listLignesBudgetaires(): Promise<LigneBudgetaireReference[]> {
  const response = await api.get<LigneBudgetaireReference[]>("/referentiels/lignes-budgetaires");
  return response.data;
}

export async function listDocumentsM5(typeDocument?: string): Promise<DocumentM5Reference[]> {
  const response = await api.get<DocumentM5Reference[]>("/referentiels/documents-m5", {
    params: { typeDocument: typeDocument || undefined },
  });
  return response.data;
}

export async function createDocumentM5(payload: CreateDocumentM5Payload): Promise<DocumentM5Reference> {
  const response = await api.post<DocumentM5Reference>("/referentiels/documents-m5", payload);
  return response.data;
}

export async function createTiers(payload: CreateTiersPayload): Promise<FournisseurReference> {
  const response = await api.post<FournisseurReference>("/referentiels/tiers", payload);
  return response.data;
}

export async function createLigneBudgetaire(payload: CreateLigneBudgetairePayload): Promise<LigneBudgetaireReference> {
  const response = await api.post<LigneBudgetaireReference>("/referentiels/lignes-budgetaires", payload);
  return response.data;
}

export async function createEngagement(payload: CreateEngagementPayload): Promise<Engagement> {
  const response = await api.post<Engagement>("/engagements", payload);
  return response.data;
}

export async function getEngagement(id: string): Promise<Engagement> {
  const response = await api.get<Engagement>(`/engagements/${id}`);
  return response.data;
}

async function mutate<T>(path: string): Promise<T> {
  const response = await api.post<T>(path);
  return response.data;
}

export function submitEngagement(id: string) {
  return mutate<Engagement>(`/engagements/${id}/soumettre`);
}

export function validateEngagement(id: string) {
  return mutate<Engagement>(`/engagements/${id}/visa`);
}

export type EngagementAvis = "VISA" | "VISA_AVEC_OBSERVATIONS" | "VISA_AVEC_RESERVES";

export async function decideEngagementVisa(
  id: string,
  typeAvis: EngagementAvis,
  details?: string,
): Promise<Engagement> {
  const params = typeAvis === "VISA_AVEC_OBSERVATIONS"
    ? { typeAvis, observations: details }
    : typeAvis === "VISA_AVEC_RESERVES"
      ? { typeAvis, reserves: details }
      : { typeAvis };
  const response = await api.post<Engagement>(`/engagements/${id}/visa`, undefined, { params });
  return response.data;
}

export function confirmEngagement(id: string) {
  return mutate<Engagement>(`/engagements/${id}/confirmer`);
}

export function rejectEngagement(id: string, motif: string) {
  return api.post<Engagement>(`/engagements/${id}/rejeter`, undefined, { params: { motif } }).then((response) => response.data);
}

export async function listLiquidations(): Promise<LiquidationRecord[]> {
  const response = await api.get<LiquidationRecord[]>("/liquidations");
  return response.data;
}

export async function getLiquidation(id: string): Promise<LiquidationRecord> {
  const response = await api.get<LiquidationRecord>(`/liquidations/${id}`);
  return response.data;
}

export interface CreateLiquidationPayload {
  numero: string;
  typeFacture: string;
  numeroFacture: string;
  dateFacture: string;
  montantHT: number;
  tauxTVA: number;
  tauxImpotRetenue: number;
  detailPrestations?: string;
}

export async function createLiquidation(engagementId: string, payload: CreateLiquidationPayload): Promise<LiquidationRecord> {
  const response = await api.post<LiquidationRecord>(`/liquidations/engagement/${engagementId}`, payload);
  return response.data;
}

export function attestServiceDone(id: string) {
  return mutate<LiquidationRecord>(`/liquidations/${id}/service-fait`);
}

export function submitLiquidation(id: string) {
  return mutate<LiquidationRecord>(`/liquidations/${id}/soumettre`);
}

export function validateLiquidation(id: string) {
  return mutate<LiquidationRecord>(`/liquidations/${id}/valider`);
}

export function rejectLiquidation(id: string) {
  return mutate<LiquidationRecord>(`/liquidations/${id}/rejeter`);
}

export async function listMandats(): Promise<MandatRecord[]> {
  const response = await api.get<MandatRecord[]>("/mandats");
  return response.data;
}

export async function getMandat(id: string): Promise<MandatRecord> {
  const response = await api.get<MandatRecord>(`/mandats/${id}`);
  return response.data;
}

export async function createMandat(exerciceId: string, typeMandat: string, liquidationIds: string[]): Promise<MandatRecord> {
  const response = await api.post<MandatRecord>("/mandats", liquidationIds, { params: { exerciceId, typeMandat } });
  return response.data;
}

export async function listLiquidationsDisponiblesPourMandat(): Promise<LiquidationRecord[]> {
  const response = await api.get<LiquidationRecord[]>("/mandats/liquidations-disponibles");
  return response.data;
}

export function submitMandat(id: string) {
  return mutate<MandatRecord>(`/mandats/${id}/soumettre`);
}

export function validateMandat(id: string) {
  return mutate<MandatRecord>(`/mandats/${id}/visa`);
}

export function transmitMandatToReceiver(id: string) {
  return mutate<MandatRecord>(`/mandats/${id}/transmettre-receveur`);
}

export async function listPaiements(): Promise<PaiementRecord[]> {
  const response = await api.get<PaiementRecord[]>("/paiements");
  return response.data;
}

export async function getPaiement(id: string): Promise<PaiementRecord> {
  const response = await api.get<PaiementRecord>(`/paiements/${id}`);
  return response.data;
}

export async function listMandatsAProgrammer(): Promise<MandatPaiementDisponible[]> {
  const response = await api.get<MandatPaiementDisponible[]>("/paiements/mandats-a-payer");
  return response.data;
}

export async function createPaiement(mandatId: string, modeReglement: string, dateProgrammee: string): Promise<PaiementRecord> {
  const response = await api.post<PaiementRecord>(`/paiements/mandat/${mandatId}`, undefined, { params: { modeReglement, dateProgrammee } });
  return response.data;
}

export function startPayment(id: string) {
  return mutate<PaiementRecord>(`/paiements/${id}/demarrer`);
}

export async function cosignPayment(id: string): Promise<PaiementRecord> {
  const response = await api.post<PaiementRecord>(`/paiements/${id}/cosigner`);
  return response.data;
}

export async function executePayment(id: string, payload: PaiementExecutionPayload): Promise<PaiementRecord> {
  const response = await api.post<PaiementRecord>(`/paiements/${id}/executer`, payload);
  return response.data;
}

export async function deferPayment(id: string, justification: string): Promise<PaiementRecord> {
  const response = await api.post<PaiementRecord>(`/paiements/${id}/differe`, { justification });
  return response.data;
}

export function failPayment(id: string) {
  return mutate<PaiementRecord>(`/paiements/${id}/echec`);
}