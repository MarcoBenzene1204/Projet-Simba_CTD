import axios from "axios";

export function apiErrorMessage(error: unknown, fallback = "Une erreur est survenue.") {
  if (!axios.isAxiosError(error)) return fallback;
  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage;
  if (status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (status === 403) return "Vous n’avez pas les permissions nécessaires pour cette action.";
  if (status === 404) return "La ressource demandée est introuvable.";
  if (status === 409) return "Cette opération provoque un conflit métier.";
  if (status === 422) return "Les données fournies sont invalides.";
  if (status && status >= 500) return "Le serveur est momentanément indisponible.";
  return fallback;
}