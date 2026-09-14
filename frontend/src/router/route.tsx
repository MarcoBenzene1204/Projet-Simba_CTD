import { Connexion } from "@/pages/login/connexion";
import { LoginLayout } from "@/layouts/loginlayout";

import Accreditation from "@/pages/Admin/Accreditation";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import LigneBudgetairePage from "@/pages/Admin/LigneBudgetairePage";
import LogsPage from "@/pages/Admin/LogsPage";
import TiersPage from "@/pages/Admin/TiersPage";
import UserList from "@/pages/Admin/UserList";

import ControleurDashboard from "@/pages/controlleur/ControleurDashboard";

import EngagementPage from "@/pages/Ordonnateur/Engagements/EngagementPage";
import OrdonnateurDashboard from "@/pages/Ordonnateur/OrdonnateurDashboard";
import { ServiceFaitPage } from "@/pages/Ordonnateur/ServiceFaitPage";
import ListeLiquidation from "@/pages/Ordonnateur/Liquidations/listeLiquidation";
import ListeMandat from "@/pages/Ordonnateur/Mandats/listeMandat";
import PaiementPage from "@/pages/Paiements/PaiementPage";
import EngagementDetailsPage from "@/pages/Ordonnateur/Engagements/EngagementDetailsPage";
import CreateEngagementPage from "@/pages/Ordonnateur/Engagements/nouvelEngagement";
import LiquidationDetailsPage from "@/pages/Ordonnateur/Liquidations/LiquidationDetailsPage";
import NouvelleLiquidation from "@/pages/Ordonnateur/Liquidations/nouvelLiquidation";
import MandatDetailsPage from "@/pages/Ordonnateur/Mandats/MandatDetailsPage";
import NouveauMandat from "@/pages/Ordonnateur/Mandats/nouveauMandat";
import PaiementDetailsPage from "@/pages/Paiements/PaiementDetailsPage";
import NouveauPaiement from "@/pages/Paiements/nouveauPaiement";
import RegularisationPage from "@/pages/Regularisations/RegularisationPage";

import ProtectedRoute from "@/router/ProtectedRoute";

import { createBrowserRouter } from "react-router";

import AdminLayout from "@/layouts/admin/AdminLayout";
import PageNotFound from "@/pages/PageNotFound";

import { useAuth } from "@/auth/AuthContext";
import CosignataireDashboard from "@/pages/Cosignataire/cosignataireDashboard";
import ChefServiceDashboard from "@/pages/Chef_Service/chef-serviceDasboard";
import RegisseurDashboard from "@/pages/Regisseur/regisseurDashboard";
import ReceveurDashboard from "@/pages/Receveur/receveurDashboard";
import SuperAdminDashboard from "@/pages/Admin/SuperAdminDashboard";
import SuperAdminCollectivitesPage from "@/pages/Admin/SuperAdminCollectivitesPage";
import SuperAdminConsole from "@/pages/Admin/SuperAdminConsole";
import AIReportingPage from "@/pages/Admin/AIReportingPage";
import RoleReportingPage from "@/pages/Admin/RoleReportingPage";
import ProfilePage from "@/pages/Compte/ProfilePage";
import NotificationsPage from "@/pages/Compte/NotificationsPage";
import BillingPage from "@/pages/Compte/BillingPage";

/*
 * Dashboard affiché en fonction du rôle
 * attribué à l'utilisateur dans Keycloak.
 */
function DynamicDashboard() {
  const { role } = useAuth();

  switch (role) {
    case "SUPER_ADMINISTRATEUR":
      return <SuperAdminDashboard />;

    case "ADMINISTRATEUR":
      return <AdminDashboard />;

    case "CONTROLEUR_FINANCIER":
      return <ControleurDashboard />;

    case "ORDONNATEUR":
      return <OrdonnateurDashboard />;

    case "CHEF_SERVICE":
      return <ChefServiceDashboard />;

    case "COSIGNATAIRE":
      return <CosignataireDashboard />;

    case "REGISSEUR":
      return <RegisseurDashboard />;

    case "RECEVEUR":
      return <ReceveurDashboard />;

    default:
      return (
        <div>
          Aucun rôle applicatif attribué à cet utilisateur.
        </div>
      );
  }
}

export const router = createBrowserRouter([
  /* AUTHENTIFICATION */
  {
    path: "/connexion",
    element: <LoginLayout />,
    children: [
      {
        index: true,
        element: <Connexion />,
      },
    ],
  },

  /* ESPACE PROTÉGÉ (DASHBOARD) */
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />, // Utilisation du layout principal (Sidebar/Header)
        children: [
          // Route d'accueil dynamique selon le rôle
          {
            index: true,
            element: <DynamicDashboard />,
          },
          {
            path: "profil",
            element: <ProfilePage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "facturation",
            element: <BillingPage />,
          },

          /* SECTION ADMINISTRATEUR */
          {
            path: "gestion",
            element: (
              <ProtectedRoute
                allowedRoles={["ADMINISTRATEUR", "SUPER_ADMINISTRATEUR"]}
              />
            ),
            children: [
              {
                path: "users-list",
                element: <UserList />,
              },
              {
                path: "accreditation",
                element: <Accreditation />,
              },
            ],
          },
          {
            path: "administrateurs",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR"]} />,
            children: [
              {
                index: true,
                element: <UserList />,
              },
            ],
          },
          {
            path: "collectivites",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR"]} />,
            children: [{ index: true, element: <SuperAdminCollectivitesPage /> }],
          },
          {
            path: "utilisateurs",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR"]} />,
            children: [{ index: true, element: <SuperAdminConsole /> }],
          },
          {
            path: "configuration",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR"]} />,
            children: [{ index: true, element: <SuperAdminConsole /> }],
          },
          {
            path: "journalisation-systeme",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR"]} />,
            children: [{ index: true, element: <SuperAdminConsole /> }],
          },
          {
            path: "assistant-ia",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR", "ADMINISTRATEUR", "ORDONNATEUR", "CONTROLEUR_FINANCIER", "CHEF_SERVICE", "REGISSEUR", "COSIGNATAIRE", "RECEVEUR"]} />,
            children: [{ index: true, element: <AIReportingPage /> }],
          },
          {
            path: "reporting",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMINISTRATEUR", "ADMINISTRATEUR", "ORDONNATEUR", "CONTROLEUR_FINANCIER", "CHEF_SERVICE", "REGISSEUR", "COSIGNATAIRE", "RECEVEUR"]} />,
            children: [{ index: true, element: <RoleReportingPage /> }],
          },
          {
            path: "journalisation",
            element: <ProtectedRoute allowedRoles={["ADMINISTRATEUR"]} />,
            children: [
              {
                path: "logs",
                element: <LogsPage />,
              },
            ],
          },
          {
            path: "referentiel",
            element: <ProtectedRoute allowedRoles={["ADMINISTRATEUR", "ORDONNATEUR"]} />,
            children: [
              {
                path: "tiers",
                element: <TiersPage />,
              },
              {
                path: "ligne-budgetaires",
                element: <LigneBudgetairePage />,
              },
            ],
          },

          /* SECTION ORDONNATEUR */
          {
            path: "gestion-ordonnateur",
            element: <ProtectedRoute allowedRoles={["ORDONNATEUR", "CHEF_SERVICE"]} />,
            children: [
              {
                path: "lignes-budgetaires",
                element: <LigneBudgetairePage />,
              },
              {
                path: "engagement",
                element: <ProtectedRoute allowedPermissions={["engagement:lire"]} />,
                children: [{ index: true, element: <EngagementPage /> }],
              },
              {
                path: "engagement/:id",
                element: <ProtectedRoute allowedPermissions={["engagement:lire"]} />,
                children: [{ index: true, element: <EngagementDetailsPage /> }],
              },
              {
                path: "engagement/nouveau",
                element: <ProtectedRoute allowedPermissions={["engagement:creer"]} />,
                children: [{ index: true, element: <CreateEngagementPage /> }],
              },
              {
                path: "liquidations",
                element: <ProtectedRoute allowedPermissions={["liquidation:lire"]} />,
                children: [{ index: true, element: <ListeLiquidation /> }],
              },
              {
                path: "liquidations/:id",
                element: <ProtectedRoute allowedPermissions={["liquidation:lire"]} />,
                children: [{ index: true, element: <LiquidationDetailsPage /> }],
              },
              {
                path: "liquidations/nouveau",
                element: <ProtectedRoute allowedPermissions={["liquidation:creer"]} />,
                children: [{ index: true, element: <NouvelleLiquidation /> }],
              },
              {
                path: "mandats",
                element: <ProtectedRoute allowedPermissions={["mandat:lire"]} />,
                children: [{ index: true, element: <ListeMandat /> }],
              },
              {
                path: "mandats/:id",
                element: <ProtectedRoute allowedPermissions={["mandat:lire"]} />,
                children: [{ index: true, element: <MandatDetailsPage /> }],
              },
              {
                path: "mandats/nouveau",
                element: <ProtectedRoute allowedPermissions={["mandat:creer"]} />,
                children: [{ index: true, element: <NouveauMandat /> }],
              },
              {
                path: "paiements",
                element: <ProtectedRoute allowedPermissions={["paiement:lire"]} />,
                children: [{ index: true, element: <PaiementPage /> }],
              },
              {
                path: "paiements/:id",
                element: <ProtectedRoute allowedPermissions={["paiement:lire"]} />,
                children: [{ index: true, element: <PaiementDetailsPage /> }],
              },
              {
                path: "paiements/nouveau",
                element: <ProtectedRoute allowedPermissions={["paiement:creer"]} />,
                children: [{ index: true, element: <NouveauPaiement /> }],
              },
              {
                path: "regularisations",
                element: <ProtectedRoute allowedPermissions={["regularisation:lire"]} />,
                children: [{ index: true, element: <RegularisationPage /> }],
              },
              {
                path: "service-fait",
                element: <ProtectedRoute allowedPermissions={["liquidation:attester_service_fait"]} />,
                children: [{ index: true, element: <ServiceFaitPage /> }],
              },
            ],
          },

          /* SECTION CONTRÔLEUR FINANCIER */
          {
            path: "controleur",
            element: (
              <ProtectedRoute
                allowedRoles={["ADMINISTRATEUR", "CONTROLEUR_FINANCIER"]}
              />
            ),
            children: [
              {
                index: true,
                element: <ControleurDashboard />,
              },
            ],
          },
          {
            path: "controleur/:vue",
            element: (
              <ProtectedRoute
                allowedRoles={["ADMINISTRATEUR", "CONTROLEUR_FINANCIER"]}
              />
            ),
            children: [{ index: true, element: <ControleurDashboard /> }],
          },
        ],
      },
    ],
  },

  /*PAGE 404*/
  {
    path: "*",
    element: <PageNotFound />,
  },
]);
