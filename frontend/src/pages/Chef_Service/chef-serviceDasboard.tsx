import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, FileText, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";

const initialDashboard: ReportingDashboard = {
  role: "CHEF_SERVICE",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

export default function ChefServiceDashboard() {
  const { username } = useAuth();
  const { currentTenant } = useTenant();
  const [dashboard, setDashboard] = useState<ReportingDashboard>(initialDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await reportingApi.getDashboard();
        setDashboard(data);
      } catch {
        setDashboard(initialDashboard);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const kpis = useMemo(() => {
    const base = dashboard.kpis.length > 0 ? dashboard.kpis : [
      { title: "Engagements", value: 0, detail: "Suivi de terrain" },
      { title: "Liquidations", value: 0, detail: "À traiter" },
      { title: "Dossiers en attente", value: 0, detail: "À valider" },
      { title: "Utilisateurs actifs", value: 0, detail: "Équipe" },
    ];
    return base.slice(0, 4);
  }, [dashboard.kpis]);

  const chartData = useMemo(() => {
    const data = dashboard.charts[0]?.data ?? [
      { label: "Engagements", value: 0 },
      { label: "Liquidations", value: 0 },
      { label: "Mandats", value: 0 },
      { label: "Paiements", value: 0 },
    ];
    return data;
  }, [dashboard.charts]);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Pilotage terrain</p>
        <h1 className="mt-2 text-3xl font-semibold">Bonjour {username ?? "chef de service"}</h1>
        <p className="mt-2 text-sm text-emerald-50/90">{currentTenant?.name ?? "Votre collectivité"} · Suivi des engagements, liquidations et dossiers de terrain.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const icons = [FileText, Activity, ShieldCheck, Users];
          const Icon = icons[index % icons.length];
          return (
            <Card key={kpi.title} className="border-0 shadow-sm bg-emerald-50/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-emerald-700" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-slate-900">{typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}</div>
                <p className="text-xs text-slate-600">{kpi.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-emerald-600" />Suivi opérationnel</CardTitle>
          <Badge variant="secondary">Terrain</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {chartData.map((item) => (
              <div key={item.label} className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-lg font-semibold">{item.value}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(item.value * 10, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
            {dashboard.insights.length > 0 ? dashboard.insights[0] : "Le service est stable et les dossiers sont suivis dans les délais."}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          Suivi détaillé <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Chargement des KPI…</div>}
    </div>
  );
}
