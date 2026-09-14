import api from "./axios";

export interface RegularisationRecord {
  id: string;
  numero: string;
  dateDetection: string;
  referencePaiementDetecte: string;
  montantDetecte: number;
  montantImputation?: number;
  natureDepense: string;
  description?: string;
  etat: string;
  dateEcheanceRegularisation?: string;
  ordonnateurNotifie: boolean;
}

export async function listRegularisations(): Promise<RegularisationRecord[]> {
  const response = await api.get<RegularisationRecord[]>("/regularisations");
  return response.data;
}

export async function updateRegularisation(path: string, params?: Record<string, string>) {
  const response = await api.post<RegularisationRecord>(path, undefined, { params });
  return response.data;
}