import api from "./axios";

// Contrat aligné sur le DTO renvoyé par le backend des collectivités.
export interface Collectivite {
  id: string;
  code: string;
  nom: string;
  type: string;
  region?: string;
  departement?: string;
  arrondissement?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logoUrl?: string;
  statut?: string;
  devise?: string;
  couleurPrincipale?: string;
  couleurAccent?: string;
}

// Payload accepté par CollectiviteRequest côté Spring Boot.
export interface CollectivitePayload {
  code: string;
  nom: string;
  type: string;
  region?: string;
  departement?: string;
  arrondissement?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logoUrl?: string;
  statut: string;
  fuseauHoraire: string;
  devise: string;
  couleurPrincipale: string;
  couleurAccent: string;
}

// Lecture de toutes les CTD accessibles au super-administrateur.
export async function listCollectivites(): Promise<Collectivite[]> {
  const response = await api.get<Collectivite[]>("/collectivites");
  return response.data;
}

// Création d'une CTD après validation du formulaire.
export async function createCollectivite(
  payload: CollectivitePayload,
): Promise<Collectivite> {
  const response = await api.post<Collectivite>("/collectivites", payload);
  return response.data;
}

export async function updateCollectivite(
  id: string,
  payload: CollectivitePayload,
): Promise<Collectivite> {
  const response = await api.put<Collectivite>(`/collectivites/${id}`, payload);
  return response.data;
}

export async function updateCollectiviteStatus(
  id: string,
  statut: "ACTIVE" | "SUSPENDUE" | "ARCHIVEE",
): Promise<Collectivite> {
  const response = await api.get<Collectivite>(`/collectivites/${id}`);
  const current = response.data;
  return updateCollectivite(id, {
    code: current.code,
    nom: current.nom,
    type: current.type,
    region: current.region,
    departement: current.departement,
    arrondissement: current.arrondissement,
    adresse: current.adresse,
    telephone: current.telephone,
    email: current.email,
    logoUrl: current.logoUrl,
    statut,
    fuseauHoraire: "Africa/Douala",
    devise: current.devise ?? "XAF",
    couleurPrincipale: current.couleurPrincipale ?? "#14532D",
    couleurAccent: current.couleurAccent ?? "#D9A441",
  });
}
