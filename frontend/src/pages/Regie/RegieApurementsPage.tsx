import { useEffect, useState } from "react";
import { Check, ClipboardCheck, RefreshCcw } from "lucide-react";

import { apiErrorMessage } from "@/api/api-error";
import { listRegieApurements, visaRegieApurement, type RegieApurementRecord } from "@/api/regies.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegieApurementsPage() {
  const { hasPermission } = useAuthorization();
  const [items, setItems] = useState<RegieApurementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string>();
  const [error, setError] = useState<string>();

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      setItems(await listRegieApurements());
    } catch (cause) {
      setError(apiErrorMessage(cause, "Impossible de charger les apurements de régie."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const viser = async (item: RegieApurementRecord) => {
    if (!window.confirm(`Confirmer le visa de l’apurement de la régie ${item.numeroRegie} pour ${formatCurrency(item.montantSoumis)} ?`)) return;
    setSavingId(item.id);
    setError(undefined);
    try {
      const updated = await visaRegieApurement(item.id);
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
    } catch (cause) {
      setError(apiErrorMessage(cause, "Le visa de l’apurement n’a pas pu être enregistré."));
    } finally {
      setSavingId(undefined);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">FC-DEP-006 · Contrôle financier</p><h1 className="text-2xl font-semibold tracking-tight">Apurements de régie</h1><p className="mt-1 text-sm text-muted-foreground">Examinez les justificatifs et visez les apurements soumis par les régisseurs.</p></div>
        <Button variant="outline" size="icon" aria-label="Actualiser les apurements" onClick={() => void load()} disabled={loading}><RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
      </header>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" />Apurements soumis ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Chargement des apurements…</p> : items.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Aucun apurement n’est soumis au contrôle dans votre commune.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="px-3 py-3">Régie</th><th className="px-3 py-3">Période</th><th className="px-3 py-3 text-right">Montant soumis</th><th className="px-3 py-3">État</th><th className="px-3 py-3 text-right">Action</th></tr></thead>
                <tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{item.numeroRegie}</td><td className="px-3 py-3">{formatDate(item.datePeriode)}</td><td className="px-3 py-3 text-right font-semibold tabular-nums">{formatCurrency(item.montantSoumis)}</td><td className="px-3 py-3"><Badge variant={item.etat === "EN_COURS" ? "secondary" : "default"}>{item.etat.replaceAll("_", " ")}</Badge></td><td className="px-3 py-3 text-right">{item.etat === "EN_COURS" && hasPermission("regie:apurer") && <Button size="sm" className="gap-1" onClick={() => void viser(item)} disabled={savingId === item.id}><Check className="h-4 w-4" />{savingId === item.id ? "Visa…" : "Viser"}</Button>}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}