import type { NavGroup } from "@/lib/type";
import {
  BadgePercent,
  Building,
  CheckSquare,
  Clock,
  FileCheck,
  FileText,
  IdCard,
  LayoutDashboard,
  LayoutList,
  Logs,
  Users,
  Wallet,
  Shield,
  Boxes,
  Sparkles,
} from "lucide-react";

export type role =
  | "SUPER_ADMINISTRATEUR"
  | "ADMINISTRATEUR"
  | "ORDONNATEUR"
  | "CONTROLEUR_FINANCIER"
  | "CHEF_SERVICE"
  | "RECEVEUR"
  | "COSIGNATAIRE"
  | "REGISSEUR";

export const NavigationByRole: Record<role, NavGroup[]> = {
  SUPER_ADMINISTRATEUR: [
    {
      label: "Administration globale",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
        {
          titre: "Collectivités territoriales",
          icon: Building,
          url: "/dashboard/collectivites",
        },
        {
          titre: "Administrateurs",
          icon: Users,
          url: "/dashboard/administrateurs",
        },
        {
          titre: "Utilisateurs & rôles",
          icon: Shield,
          url: "/dashboard/utilisateurs",
        },
        {
          titre: "Modules & paramètres",
          icon: Boxes,
          url: "/dashboard/configuration",
        },
        {
          titre: "Journaux système",
          icon: Logs,
          url: "/dashboard/journalisation-systeme",
        },
        {
          titre: "Reporting assisté par IA",
          icon: Sparkles,
          url: "/dashboard/reporting",
        },
      ],
    },
  ],
  ADMINISTRATEUR: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
          comingSoon: false,
        },
      ],
    },

    {
      label: "Gestion des Accès",
      items: [
        {
          titre: "Liste des utilisateurs",
          icon: Users,
          url: "/dashboard/gestion/users-list",
          comingSoon: false,
        },
        {
          titre: "Fiches & Cartes d'accréditation",
          icon: IdCard,
          url: "/dashboard/gestion/accreditation",
        },
      ],
    },

    {
      label: "Referentiels & Paramètres",
      items: [
        {
          titre: "Gestion des Tiers",
          icon: LayoutList,
          url: "/dashboard/referentiel/tiers",
          comingSoon: false,
        },
        {
          titre: "Lignes Budgétaires",
          icon: BadgePercent,
          url: "/dashboard/referentiel/ligne-budgetaires",
          comingSoon: false,
        },
      ],
    },

    {
      label: "Aide décisionnelle",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
        {
          titre: "Journaux & Logs",
          icon: Logs,
          url: "/dashboard/journalisation/logs",
        },
      ],
    },
  ],

  //ORDONNATEUR
  ORDONNATEUR: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },

    {
      label: "Gestion Budgétaire",
      items: [
        {
          titre: "Lignes Budgétaires",
          icon: Wallet,
          url: "/dashboard/gestion-ordonnateur/lignes-budgetaires",
        },
        { titre: "Engagements", icon: FileText, url: "/dashboard/gestion-ordonnateur/engagement", permission: "engagement:lire" },
        { titre: "Liquidations", icon: FileCheck, url: "/dashboard/gestion-ordonnateur/liquidations", permission: "liquidation:lire" },
        { titre: "Mandats", icon: FileCheck, url: "/dashboard/gestion-ordonnateur/mandats", permission: "mandat:lire" },
        { titre: "Paiements", icon: Wallet, url: "/dashboard/gestion-ordonnateur/paiements", permission: "paiement:lire" },
        { titre: "Régularisations 470XX", icon: FileText, url: "/dashboard/gestion-ordonnateur/regularisations", permission: "regularisation:lire" },
        {
          titre: "Gestion des Tiers",
          icon: Building,
          url: "/dashboard/referentiel/tiers",
        },
      ],
    },

    {
      label: "Suivi & Constat",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
        {
          titre: "Service Fait",
          icon: CheckSquare,
          url: "/dashboard/gestion-ordonnateur/service-fait",
          permission: "liquidation:attester_service_fait",
        },
      ],
    },
  ],

  //CONTROLEUR FINANCIER
  CONTROLEUR_FINANCIER: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },

    {
      label: "Contrôle & Visas",
      items: [
        {
          titre: "Dossiers en Attente",
          icon: Clock,
          url: "/dashboard/controleur/en-attente",
        },
        {
          titre: "Historique des Visas",
          icon: FileCheck,
          url: "/dashboard/controleur/historique",
        },
      ],
    },

    {
      label: "Consultation",
      items: [
        {
          titre: "Suivi des Engagements",
          icon: FileText,
          url: "/dashboard/controleur/engagements",
        },
        {
          titre: "Crédits & Budget",
          icon: Wallet,
          url: "/dashboard/gestion-ordonnateur/lignes-budgetaires",
        },
      ],
    },
  ],

  // CHEF_SERVICE
  CHEF_SERVICE: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },

    {
      label: "Opérations Terrain",
      items: [
        {
          titre: "Attestations de Service Fait",
          icon: CheckSquare,
          url: "/dashboard/gestion-ordonnateur/service-fait",
        },
        {
          titre: "Consultation Engagements",
          icon: FileText,
          url: "/dashboard/gestion-ordonnateur/engagement",
        },
      ],
    },
    {
      label: "Aide décisionnelle",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
      ],
    },
  ],

  // REGISSEUR
  REGISSEUR: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },
    {
      label: "Aide décisionnelle",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
      ],
    },
  ],

  //COSIGNATAIRE
  COSIGNATAIRE: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },
    {
      label: "Aide décisionnelle",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
      ],
    },
  ],

  //RECEVEUR
  RECEVEUR: [
    {
      label: "Accueil",
      items: [
        {
          titre: "Tableau de bord",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
      ],
    },
    {
      label: "Aide décisionnelle",
      items: [
        {
          titre: "Reporting",
          icon: LayoutDashboard,
          url: "/dashboard/reporting",
        },
      ],
    },
  ],
};
