import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";

const initialDashboard: ReportingDashboard = {
  role: "COSIGNATAIRE",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

export default function CosignataireDashboard() {
  const { username } = useAuth();
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
      { title: "Dossiers à visa", value: 0, detail: "À valider" },
      { title: "Mandats", value: 0, detail: "À signer" },
      { title: "Engagements", value: 0, detail: "À examiner" },
      { title: "Paiements", value: 0, detail: "À autoriser" },
    ];
    return base.slice(0, 4);
  }, [dashboard.kpis]);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-orange-900/10 bg-gradient-to-br from-orange-950 via-orange-800 to-orange-600 p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-100">Visa / cosignature</p>
        <h1 className="mt-2 text-3xl font-semibold">Bonjour {username ?? "cosignataire"}</h1>
        <p className="mt-2 text-sm text-orange-50/90">{currentTenant?.name ?? "Votre collectivité"} · Validation des dossiers et autorisations de paiement.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const icons = [ShieldCheck, FileText, Users, CheckCircle2];
          const Icon = icons[index % icons.length];
          return (
            <Card key={kpi.title} className="border-0 shadow-sm bg-orange-50/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-orange-700" />
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
          <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-orange-600" />Suivi des visas</CardTitle>
          <Badge variant="secondary">Autorisation</Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">
            {dashboard.insights[1] ?? "Les dossiers en attente sont organisés par priorité de validation."}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          Consulter les visas <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
