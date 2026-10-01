import type { RoleApplication } from "@/config/roleConfig";

type PermissionCheck = (permission: string) => boolean;

export function getDashboardDestination(
  label: string,
  role: RoleApplication,
  hasPermission: PermissionCheck,
): string {
  const value = label.toLocaleLowerCase("fr-FR");
  const includes = (...terms: string[]) => terms.some((term) => value.includes(term));

  if (role === "SUPER_ADMINISTRATEUR") {
    if (includes("m5", "document", "préparatoire", "preparatoire") && hasPermission("parametrage:lire")) return "/dashboard/documents-m5";
    if (includes("collectivit", "commune") && hasPermission("collectivite:lire")) return "/dashboard/collectivites";
    if (includes("utilisateur", "équipe") && hasPermission("parametrage:lire")) return "/dashboard/utilisateurs";
    return "/dashboard/reporting";
  }

  if (role === "ADMINISTRATEUR") {
    if (includes("m5", "document", "préparatoire", "preparatoire") && hasPermission("parametrage:lire")) return "/dashboard/documents-m5";
    if (includes("journal", "log") && hasPermission("parametrage:lire")) return "/dashboard/journalisation/logs";
    if (includes("analyse", "diagnostic", "cause", "solution", "ia")) return "/dashboard/assistant-ia";
    if (includes("budget", "crédit", "credit", "ligne") && hasPermission("parametrage:lire")) return "/dashboard/referentiel/ligne-budgetaires";
    if (includes("tiers", "fournisseur", "prestataire") && hasPermission("parametrage:lire")) return "/dashboard/referentiel/tiers";
    if (includes("accréditation", "accreditation") && hasPermission("parametrage:lire")) return "/dashboard/gestion/accreditation";
    if (includes("utilisateur", "équipe") && hasPermission("parametrage:lire")) return "/dashboard/gestion/users-list";
    if (includes("engagement") && hasPermission("engagement:lire")) return "/dashboard/gestion-ordonnateur/engagement";
    if (includes("liquidation") && hasPermission("liquidation:lire")) return "/dashboard/gestion-ordonnateur/liquidations";
    if (includes("mandat") && hasPermission("mandat:lire")) return "/dashboard/gestion-ordonnateur/mandats";
    return "/dashboard/reporting";
  }

  if (role === "CONTROLEUR_FINANCIER") {
    if (includes("historique") && hasPermission("engagement:lire")) return "/dashboard/controleur/historique";
    if (includes("liquidation") && hasPermission("liquidation:lire")) return "/dashboard/controleur/liquidations";
    if (includes("mandat") && hasPermission("mandat:lire")) return "/dashboard/controleur/mandats";
    if (includes("engagement") && hasPermission("engagement:lire")) return "/dashboard/controleur/engagements";
    if (includes("visa", "attente", "soumis", "dossier") && hasPermission("engagement:lire")) return "/dashboard/controleur/en-attente";
    return "/dashboard/reporting";
  }

  if (includes("reporting", "synthèse", "synthese", "performance", "répartition", "repartition")) return "/dashboard/reporting";

  if (role === "ORDONNATEUR") {
    if (includes("régularisation", "regularisation") && hasPermission("regularisation:lire")) return "/dashboard/regularisations";
    if (includes("liquidation") && hasPermission("liquidation:lire")) return "/dashboard/gestion-ordonnateur/liquidations";
    if (includes("mandat") && hasPermission("mandat:lire")) return "/dashboard/gestion-ordonnateur/mandats";
    if (includes("visa", "dossier", "retard") && hasPermission("engagement:lire")) return "/dashboard/gestion-ordonnateur/engagement";
    if (includes("engagement") && hasPermission("engagement:lire")) return "/dashboard/gestion-ordonnateur/engagement";
    return "/dashboard/reporting";
  }

  if (role === "CHEF_SERVICE") {
    if (includes("service fait", "attestation") && hasPermission("liquidation:attester_service_fait")) return "/dashboard/gestion-ordonnateur/service-fait";
    if (includes("liquidation") && hasPermission("liquidation:lire")) return "/dashboard/gestion-ordonnateur/liquidations";
    if (includes("engagement") && hasPermission("engagement:lire")) return "/dashboard/gestion-ordonnateur/engagement";
    if (hasPermission("liquidation:attester_service_fait")) return "/dashboard/gestion-ordonnateur/service-fait";
    return "/dashboard/reporting";
  }

  if (role === "COSIGNATAIRE") {
    return hasPermission("paiement:lire") ? "/dashboard/paiements" : "/dashboard/reporting";
  }

  if (role === "RECEVEUR") {
    if (includes("régularisation", "regularisation") && hasPermission("regularisation:lire")) return "/dashboard/regularisations";
    return hasPermission("paiement:lire") ? "/dashboard/paiements" : "/dashboard/reporting";
  }

  if (role === "REGISSEUR") {
    if (includes("régularisation", "regularisation") && hasPermission("regularisation:lire")) return "/dashboard/regularisations";
    return hasPermission("regie:lire") ? "/dashboard/regie" : "/dashboard/reporting";
  }

  return "/dashboard/reporting";
}