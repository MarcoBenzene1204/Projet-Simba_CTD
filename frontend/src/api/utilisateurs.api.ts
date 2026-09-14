import api from "./axios";
import type { RoleApplication } from "@/config/roleConfig";

export type { RoleApplication } from "@/config/roleConfig";

export interface Utilisateur {
  id: string;
  identifiantKeycloak: string;
  nomUtilisateur?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  collectiviteId?: string;
  collectiviteNom?: string;
  role: RoleApplication;
  statut: string;
}

export interface UtilisateurPayload {
  identifiantKeycloak: string;
  nomUtilisateur?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  role: RoleApplication;
  collectiviteId?: string;
}

export async function listUtilisateurs(): Promise<Utilisateur[]> {
  const response = await api.get<Utilisateur[]>("/admin/utilisateurs");
  return response.data;
}

export async function listAdministrateurs(): Promise<Utilisateur[]> {
  const response = await api.get<Utilisateur[]>("/super-admin/utilisateurs");
  return response.data;
}

export async function createUtilisateur(payload: UtilisateurPayload): Promise<Utilisateur> {
  const response = await api.post<Utilisateur>("/admin/utilisateurs", payload);
  return response.data;
}

export async function createAdministrateur(payload: Omit<UtilisateurPayload, "role">): Promise<Utilisateur> {
  const response = await api.post<Utilisateur>("/super-admin/utilisateurs", payload);
  return response.data;
}

export async function updateUtilisateur(
  id: string,
  payload: Partial<UtilisateurPayload> & { statut?: string },
): Promise<Utilisateur> {
  const response = await api.patch<Utilisateur>(`/admin/utilisateurs/${id}`, payload);
  return response.data;
}