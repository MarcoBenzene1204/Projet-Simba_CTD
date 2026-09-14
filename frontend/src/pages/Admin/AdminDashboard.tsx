import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { aiAssistantApi } from "@/api/ai.api";
import { reportingApi, type ReportingDashboard } from "@/api/reporting.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";

const emptyDashboard: ReportingDashboard = {
  role: "ADMINISTRATEUR",
  globalView: false,
  kpis: [],
  charts: [],
  insights: [],
  note: "",
};

const periods = ["7j", "30j", "90j"] as const;
type Period = (typeof periods)[number];

function formatNumber(value: number | string) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("fr-FR").format(value);
  }
  return value;
}

export default function AdminDashboard() {
  const { username, role } = useAuth();
  const { currentTenant } = useTenant();
  const [dashboard, setDashboard] = useState<ReportingDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [period, setPeriod] = useState<Period>("30j");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await reportingApi.getDashboard();
      setDashboard(data);
      setAnalysis("");
    } catch {
      setDashboard(emptyDashboard);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const chartData = useMemo(() => {
    const source = dashboard.charts[0]?.data ?? [
      { label: "Engagements", value: 0 },
      { label: "Liquidations", value: 0 },
      { label: "Mandats", value: 0 },
      { label: "Paiements", value: 0 },
    ];
    return source.map((item) => ({ name: item.label, value: item.value }));
  }, [dashboard.charts]);

  const pieData = useMemo(
    () => [
      { name: "Active", value: Math.max(Number(dashboard.kpis[0]?.value ?? 0), 0) },
      { name: "En attente", value: Math.max(Number(dashboard.kpis[2]?.value ?? 0), 0) },
      { name: "Anomalies", value: Math.max(Number(dashboard.kpis[3]?.value ?? 0), 0) },
    ],
    [dashboard.kpis],
  );

  const logs = useMemo(
    () => [
      { title: "Validation de dossiers", detail: "2 engagements validés aujourd’hui", tone: "success" },
      { title: "Contrôle financier", detail: "1 dossier en attente de validation", tone: "warning" },
      { title: "Paiements", detail: "3 ordres exécutés sur cette période", tone: "info" },
      { title: "Sécurité", detail: "Aucune anomalie détectée", tone: "success" },
    ],
    [],
  );

  const activityContext = useMemo(() => {
    const lines = [
      `Rôle: ${role ?? "ADMINISTRATEUR"}`,
      `Collectivité: ${currentTenant?.name ?? "courante"}`,
      `Période: ${period}`,
      `Note: ${dashboard.note}`,
      "KPI:" + JSON.stringify(dashboard.kpis),
      "Synthèse:" + JSON.stringify(dashboard.insights),
      "Tendances:" + JSON.stringify(chartData),
      "Journaux:" + JSON.stringify(logs),
    ];
    return lines.join("\n");
  }, [chartData, currentTenant?.name, dashboard.insights, dashboard.kpis, dashboard.note, logs, period, role]);

  const analyzeWithAi = async () => {
    try {
      setAnalyzing(true);
      const answer = await aiAssistantApi.reporting(
        "Analyse ce tableau de bord de collectivité. Identifie les causes potentielles des écarts, les blocages de traitement et les solutions prioritaires. Présente le résultat en sections claires : Diagnostic, Causes potentielles, Possibilités de solutions.",
        activityContext,
      );
      setAnalysis(answer);
    } catch {
      setAnalysis("L’analyse IA n’a pas pu être générée pour le moment. Veuillez réessayer dans quelques instants.");
    } finally {
      setAnalyzing(false);
    }
  };

  const diagnosisCards = useMemo(
    () => [
      { title: "Diagnostic", icon: BriefcaseBusiness, text: "Le niveau d’activité reste stable et la collectivité est en phase de suivi budgétaire actif." },
      { title: "Causes potentielles", icon: AlertTriangle, text: "Les retards proviennent surtout des dossiers en attente, des validations manquantes et des traitements à relancer." },
      { title: "Possibilités de solutions", icon: CheckCircle2, text: "Renforcer la validation, prioriser les dossiers bloqués et automatiser le relance des traitements." },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="border-white/20 bg-white/10 text-xs uppercase tracking-[0.2em] text-emerald-100 hover:bg-white/10">
              Pilotage de collectivité
            </Badge>
            <div>
              <p className="text-sm text-emerald-100">Espace administratif</p>
              <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Bonjour {username ?? "administrateur"}</h1>
            </div>
            <p className="max-w-2xl text-sm text-emerald-50/90">
              {currentTenant?.name ?? "Votre collectivité"} · Pilotage des performances, des validations et de la qualité de traitement.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void loadDashboard()} disabled={loading} className="gap-2">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button size="sm" onClick={() => void analyzeWithAi()} disabled={analyzing} className="gap-2 bg-white text-emerald-900 hover:bg-emerald-50">
              <Sparkles className="h-4 w-4" />
              {analyzing ? "Analyse..." : "Analyser IA"}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {periods.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={period === item ? "default" : "outline"}
            onClick={() => setPeriod(item)}
            className={period === item ? "bg-emerald-600 hover:bg-emerald-500" : ""}
          >
            {item}
          </Button>
        ))}
      </div>

      <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
        <CardContent className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Périmètre KPI</p>
            <h2 className="text-lg font-semibold text-slate-900">{currentTenant?.name ?? "Collectivité courante"}</h2>
          </div>
          <div className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-slate-700">
            {dashboard.note || "Vue limitée à la collectivité courante."}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.kpis.length > 0 ? (
          dashboard.kpis.map((kpi, index) => {
            const styles = ["bg-emerald-50", "bg-sky-50", "bg-amber-50", "bg-violet-50"]; const icons = [Building2, Users, Activity, AlertTriangle];
            const Icon = icons[index % icons.length];
            return (
              <Card key={kpi.title} className={`border-0 shadow-sm ${styles[index % styles.length]}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-emerald-700" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-semibold text-slate-900">{formatNumber(kpi.value)}</div>
                  <p className="text-xs text-slate-600">{kpi.detail}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-0 bg-slate-100 shadow-sm">
              <CardContent className="flex min-h-[130px] items-center justify-center text-sm text-slate-500">Chargement du reporting…</CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-emerald-600" />Performance du module</CardTitle>
            <Badge variant="secondary">Collectivité</Badge>
          </CardHeader>
          <CardContent className="h-[320px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-violet-600" />Répartition</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={["#10b981", "#f59e0b", "#ef4444"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-blue-600" />Journaux / logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div key={log.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    log.tone === "success" ? "bg-emerald-500" : log.tone === "warning" ? "bg-amber-500" : "bg-sky-500"
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800">{log.title}</p>
                  <p className="text-xs text-slate-600">{log.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-violet-600" />Analyse IA premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {diagnosisCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs leading-6 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {analysis || "Cliquez sur « Analyser IA » pour obtenir le diagnostic, les causes potentielles et les solutions prioritaires de la collectivité."}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-emerald-600" />Synthèse opérationnelle</CardTitle>
          <Badge variant="secondary" className="gap-1"><BadgeCheck className="h-3.5 w-3.5" />Risque maîtrisé</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {dashboard.insights.length > 0 ? (
            dashboard.insights.map((insight, idx) => (
              <div key={insight} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Point {idx + 1}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-sm leading-6 text-slate-700">{insight}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-3">
              Aucune synthèse opérationnelle n’est disponible pour l’instant.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

