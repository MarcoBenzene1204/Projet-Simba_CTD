import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/budget/PageHeader";
import { useAuthorization } from "@/auth/useAuthorization";
import { useNavigate } from "react-router";
import { useTenant } from "@/tenant/TenantContext";
import { useAuth } from "@/auth/AuthContext";
import { useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock3, ShieldCheck, TrendingUp } from "lucide-react";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { budgetDashboardApi } from "@/api/budget.api";
import type { BudgetSummary } from "@/types/budget";
import { DashboardLink } from "@/components/dashboard/DashboardLink";
import { getDashboardDestination } from "@/lib/dashboardNavigation";

const initialDashboard: ReportingDashboard = {
  role: "ORDONNATEUR",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

export default function OrdonnateurDashboard() {
  useEffect(() => {
      const load = async () => {
        try {
          const data = await reportingApi.getDashboard();
          setDashboard(data);
        } catch {
          setDashboard(initialDashboard);
        }
      };
      void load();
    }, []);

  const { username, roles } = useAuth();
  const { currentTenant } = useTenant();
  const [dashboard, setDashboard] = useState<ReportingDashboard>(initialDashboard);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>();
  const [budgetLoading, setBudgetLoading] = useState(true);

  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    void budgetDashboardApi.obtenirResume()
      .then(setBudgetSummary)
      .catch(() => setBudgetSummary(undefined))
      .finally(() => setBudgetLoading(false));
  }, []);
  const displayName = username ?? "Ordonnateur";
  const displayRole = roles[0] ?? "ORDONNATEUR";

  const kpis = useMemo(() => {
      const base = dashboard.kpis.length > 0 ? dashboard.kpis : [
        { title: "Dossiers soumis", value: 0, detail: "À contrôler" },
        { title: "Visas à traiter", value: 0, detail: "Validation" },
        { title: "Retards", value: 0, detail: "Dossiers bloqués" },
        { title: "Utilisateurs actifs", value: 0, detail: "Équipe" },
      ];
      return base.slice(0, 4);
    }, [dashboard.kpis]);
  
    const chartData = useMemo(() => {
      return dashboard.charts[0]?.data ?? [
        { label: "Engagements", value: 0 },
        { label: "Liquidations", value: 0 },
        { label: "Mandats", value: 0 },
        { label: "Paiements", value: 0 },
      ];
    }, [dashboard.charts]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-6 py-8 text-white shadow-sm sm:px-10">
        <p className="text-2xl font-medium text-emerald-100">Espace {displayRole}</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Bonjour {displayName}</h1>
        <p className="mt-2 text-sm text-emerald-100">{currentTenant?.name ?? "Votre collectivité"} · Suivi des opérations de votre commune.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const icons = [CheckCircle2, Clock3, Activity, ShieldCheck];
          const Icon = icons[index % icons.length];
          return (
            <DashboardLink key={kpi.title} to={getDashboardDestination(kpi.title, roles[0] ?? "ORDONNATEUR", hasPermission)} label={`Ouvrir ${kpi.title}`}>
            <Card className="h-full border-0 bg-primary/8 shadow-sm transition-colors hover:bg-primary/12">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-primary">{typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}</div>
                <p className="text-xs text-slate-600">{kpi.detail}</p>
              </CardContent>
            </Card>
            </DashboardLink>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />Ordonnateur</CardTitle>
          <Badge variant="secondary">Validation</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {chartData.map((item) => (
              <DashboardLink key={item.label} to={getDashboardDestination(item.label, roles[0] ?? "ORDONNATEUR", hasPermission)} label={`Consulter ${item.label}`} className="rounded-xl border bg-slate-50 p-4 hover:border-primary/50 hover:bg-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-lg font-semibold">{item.value}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(item.value * 10, 100)}%` }} />
                </div>
              </DashboardLink>
            ))}
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
            {dashboard.insights[0] ?? "Le contrôle reste stable et les dossiers importants sont traités dans les délais."}
          </div>
        </CardContent>
      </Card>

      <PageHeader
        title="Exécution budgétaire"
        description={
          currentTenant
            ? `Execution budgétaire - ${currentTenant.name}`
            : "Execution budgétaire"
        }
        action={
          hasPermission("engagement:creer") && (
            <Button className="gap-2 bg-gradient-to-br from-primary to-secondary" onClick={() => navigate("/dashboard/gestion-ordonnateur/engagement/nouveau")}>
              <Plus className="h-4 w-4" /> Créer un Engagement
            </Button>
          )
        }
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Situation budgétaire</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Engagements", count: budgetSummary?.totalEngagements, amount: budgetSummary?.montantEngages },
            { title: "Liquidations", count: budgetSummary?.totalLiquidations, amount: budgetSummary?.montantLiquide },
            { title: "Mandats", count: budgetSummary?.totalMandats, amount: budgetSummary?.montantMandate },
          ].map((item) => (
            <DashboardLink
              key={item.title}
              to={getDashboardDestination(item.title, roles[0] ?? "ORDONNATEUR", hasPermission)}
              label={`Consulter les ${item.title.toLocaleLowerCase("fr-FR")}`}
            >
              <Card className="h-full border-primary/10 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-primary">
                    {budgetLoading ? "…" : item.count?.toLocaleString("fr-FR") ?? "Indisponible"}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {budgetLoading
                      ? "Chargement des données"
                      : item.amount === undefined
                        ? "Résumé budgétaire indisponible"
                        : `${new Intl.NumberFormat("fr-FR").format(item.amount)} FCFA engagés`}
                  </p>
                </CardContent>
              </Card>
            </DashboardLink>
          ))}
        </div>
      </section>
    </div>
  );
}
