import api from "./axios";

export interface RegieRecord {
  id: string;
  numeroRegie: string;
  dateCreation: string;
  periodicite: string;
  montantPlafond: number;
  montantEngages: number;
  montantAutorises: number;
  soldeDisponible: number;
  naturesAutorisees: string;
  etat: string;
  regieClotureExercice?: boolean;
}

export interface RegieApurementRecord {
  id: string;
  regieId: string;
  numeroRegie: string;
  datePeriode: string;
  montantSoumis: number;
  etat: "EN_COURS" | "VISEE_CF" | "ORDONNANCEE" | "PAYEE";
  dateVisaCF?: string;
}

export async function listMyRegies(): Promise<RegieRecord[]> {
  const response = await api.get<RegieRecord[]>("/regies-avances");
  return response.data;
}

export async function listRegieApurements(): Promise<RegieApurementRecord[]> {
  const response = await api.get<RegieApurementRecord[]>("/regies-avances/apurements");
  return response.data;
}

export async function visaRegieApurement(id: string): Promise<RegieApurementRecord> {
  const response = await api.put<RegieApurementRecord>(`/regies-avances/apurements/${id}/visa-cf`);
  return response.data;
}
