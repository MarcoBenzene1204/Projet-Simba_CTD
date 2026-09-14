import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, Banknote, CircleDashed, FileText, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleReportingCard } from "@/components/ai/RoleReportingCard";
import { useAuth } from "@/auth/AuthContext";
import { reportingApi, type ReportingSummary } from "@/api/reporting.api";
import { apiErrorMessage } from "@/api/api-error";

const emptySummary: ReportingSummary = {
  totalEngagements: 0,
  totalLiquidations: 0,
  totalMandats: 0,
  totalPaiements: 0,
  montantEngages: 0,
  montantLiquidations: 0,
  montantMandats: 0,
  montantPaiements: 0,
  engagementsSoumis: 0,
  liquidationsValidees: 0,
  mandatsTransmis: 0,
  paiementsExecutes: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RoleReportingPage() {
  const { role } = useAuth();
  const [summary, setSummary] = useState<ReportingSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reportingApi.getSummary();
        setSummary(data);
      } catch (err) {
        setError(apiErrorMessage(err, "Impossible de charger le reporting."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const title = useMemo(() => {
    switch (role) {
      case "SUPER_ADMINISTRATEUR":
        return "Reporting global CTD";
      case "ADMINISTRATEUR":
        return "Reporting institutionnel";
      case "ORDONNATEUR":
        return "Suivi budgétaire opérationnel";
      case "CONTROLEUR_FINANCIER":
        return "Contrôle financier";
      default:
        return "Reporting métier";
    }
  }, [role]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Reporting</p>
            <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()} disabled={loading}>
            Actualiser
          </Button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RoleReportingCard title="Engagements" value={String(summary.totalEngagements)} detail="Total enregistré" icon={FileText} accentClassName="text-emerald-600" />
        <RoleReportingCard title="Liquidations" value={String(summary.totalLiquidations)} detail="Dossiers traités" icon={ShieldCheck} accentClassName="text-blue-600" />
        <RoleReportingCard title="Mandats" value={String(summary.totalMandats)} detail="En cours de traitement" icon={ArrowRightLeft} accentClassName="text-violet-600" />
        <RoleReportingCard title="Paiements" value={String(summary.totalPaiements)} detail="Instructions exécutées" icon={Banknote} accentClassName="text-amber-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CircleDashed className="h-4 w-4 text-emerald-600" /> Montants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Engagements</span><strong>{formatCurrency(summary.montantEngages)}</strong></div>
            <div className="flex items-center justify-between"><span>Liquidations</span><strong>{formatCurrency(summary.montantLiquidations)}</strong></div>
            <div className="flex items-center justify-between"><span>Mandats</span><strong>{formatCurrency(summary.montantMandats)}</strong></div>
            <div className="flex items-center justify-between"><span>Paiements</span><strong>{formatCurrency(summary.montantPaiements)}</strong></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Suivi de progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Engagements soumis</span><strong>{summary.engagementsSoumis}</strong></div>
            <div className="flex items-center justify-between"><span>Liquidations validées</span><strong>{summary.liquidationsValidees}</strong></div>
            <div className="flex items-center justify-between"><span>Mandats transmis</span><strong>{summary.mandatsTransmis}</strong></div>
            <div className="flex items-center justify-between"><span>Paiements exécutés</span><strong>{summary.paiementsExecutes}</strong></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
