import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, Clock3, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { useAuth } from "@/auth/AuthContext";
import { useAuthorization } from "@/auth/useAuthorization";
import { useTenant } from "@/tenant/TenantContext";

const initialDashboard: ReportingDashboard = {
  role: "CONTROLEUR_FINANCIER",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

export default function ControleurDashboard() {
  const navigate = useNavigate();
  const { username, roles } = useAuth();
  const { hasPermission } = useAuthorization();
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

  const displayName = username ?? "Contrôleur";
  const displayRole = roles[0] ?? "CONTROLEUR_FINANCIER";

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

  const getDestination = (label: string) => {
    const normalizedLabel = label.toLocaleLowerCase("fr-FR");
    if (normalizedLabel.includes("historique")) return "/dashboard/controleur/historique";
    if (normalizedLabel.includes("liquidation") && hasPermission("liquidation:lire")) return "/dashboard/controleur/liquidations";
    if (normalizedLabel.includes("mandat") && hasPermission("mandat:lire")) return "/dashboard/controleur/mandats";
    if ((normalizedLabel.includes("engagement") || normalizedLabel.includes("visa") || normalizedLabel.includes("attente")) && hasPermission("engagement:lire")) {
      return normalizedLabel.includes("engagement") && !normalizedLabel.includes("attente") && !normalizedLabel.includes("visa")
        ? "/dashboard/controleur/engagements"
        : "/dashboard/controleur/en-attente";
    }
    return "/dashboard/reporting";
  };

  const validationTarget = hasPermission("engagement:lire")
    ? { path: "/dashboard/controleur/en-attente", label: "Voir la file des engagements" }
    : hasPermission("liquidation:lire")
      ? { path: "/dashboard/controleur/liquidations", label: "Voir les liquidations à contrôler" }
      : hasPermission("mandat:lire")
        ? { path: "/dashboard/controleur/mandats", label: "Voir les mandats à contrôler" }
        : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-6 py-8 text-white shadow-sm sm:px-10">
        <p className="text-2xl font-medium text-emerald-100">Espace {displayRole}</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Bonjour {displayName}</h1>
        <p className="mt-2 text-sm text-emerald-100">{currentTenant?.name ?? "Votre collectivité"} · Suivi des opérations et contrôles financiers.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const icons = [CheckCircle2, Clock3, Activity, ShieldCheck];
          const Icon = icons[index % icons.length];
          return (
            <Link key={kpi.title} to={getDestination(kpi.title)} aria-label={`Ouvrir ${kpi.title}`} className="block rounded-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Card className="h-full border-0 bg-primary/20 shadow-sm transition-colors hover:bg-primary/25">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-slate-900">{typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}</div>
                <p className="text-xs text-slate-600">{kpi.detail}</p>
              </CardContent>
            </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />Contrôle financier</CardTitle>
          <Badge variant="secondary">Validation</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {chartData.map((item) => (
              <Link key={item.label} to={getDestination(item.label)} aria-label={`Consulter ${item.label}`} className="block rounded-xl border bg-slate-50 p-4 transition hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-lg font-semibold">{item.value}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(item.value * 10, 100)}%` }} />
                </div>
              </Link>
            ))}
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
            {dashboard.insights[0] ?? "Le contrôle reste stable et les dossiers importants sont traités dans les délais."}
          </div>
        </CardContent>
      </Card>

      {validationTarget && (
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2" onClick={() => navigate(validationTarget.path)}>
            {validationTarget.label} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
