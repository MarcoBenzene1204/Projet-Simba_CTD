import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";
import { useAuthorization } from "@/auth/useAuthorization";
import { useNavigate } from "react-router";
import { DashboardLink } from "@/components/dashboard/DashboardLink";
import { getDashboardDestination } from "@/lib/dashboardNavigation";

const initialDashboard: ReportingDashboard = {
  role: "REGISSEUR",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

export default function RegisseurDashboard() {
  const { username, role } = useAuth();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [dashboard, setDashboard] = useState<ReportingDashboard>(initialDashboard);

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

  const kpis = useMemo(() => {
    const base = dashboard.kpis.length > 0 ? dashboard.kpis : [
      { title: "Mandats", value: 0, detail: "Transmission" },
      { title: "Liquidations", value: 0, detail: "Saisie" },
      { title: "Visas en attente", value: 0, detail: "Validation" },
      { title: "Paiements", value: 0, detail: "Traités" },
    ];
    return base.slice(0, 4);
  }, [dashboard.kpis]);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-violet-900/10 bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-100">Régie / mandats</p>
        <h1 className="mt-2 text-3xl font-semibold">Bonjour {username ?? "régisseur"}</h1>
        <p className="mt-2 text-sm text-violet-50/90">{currentTenant?.name ?? "Votre collectivité"} · Suivi des mandats et des opérations de régie.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const icons = [Wallet, FileCheck2, ShieldCheck, CheckCircle2];
          const Icon = icons[index % icons.length];
          return (
            <DashboardLink key={kpi.title} to={getDashboardDestination(kpi.title, role ?? "REGISSEUR", hasPermission)} label={`Ouvrir ${kpi.title}`}>
            <Card className="h-full border-0 bg-primary/8 shadow-sm transition-colors hover:bg-primary/12">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-primary">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-secondary" />
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
          <CardTitle className="flex items-center gap-2 text-lg text-secondary"><TrendingUp className="h-5 w-5 text-secondary" />Activité de régie</CardTitle>
          <Badge variant="secondary">Mandats</Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/40 bg-secondary/10 p-4 text-sm text-slate-700">
            {dashboard.insights[0] ?? "Les dossiers de régie sont suivis de façon régulière et les mandats sont bien ordonnés."}
          </div>
        </CardContent>
      </Card>

      {hasPermission("regie:lire") && (
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard/regie")}>
            Voir la régie <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
