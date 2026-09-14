import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { createLiquidation } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NouvelleLiquidation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasPermission } = useAuthorization();
  const [engagementId, setEngagementId] = useState(params.get("engagementId") ?? "");
  const [form, setForm] = useState({ numero: "", typeFacture: "COMPLETE", numeroFacture: "", dateFacture: "", montantHT: "", tauxTVA: "", tauxImpotRetenue: "", detailPrestations: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const montantTTC = useMemo(() => { const ht = Number(form.montantHT) || 0; return ht + (ht * (Number(form.tauxTVA) || 0)) / 100; }, [form.montantHT, form.tauxTVA]);

  if (!hasPermission("liquidation:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer une liquidation.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!engagementId.trim() || !form.numero.trim() || !form.numeroFacture.trim() || !form.dateFacture || Number(form.montantHT) <= 0) {
      setError("Renseignez l'engagement, les numéros, la date et un montant HT positif.");
      return;
    }
    if (!window.confirm("Confirmer la création de cette liquidation ? L'engagement doit être confirmé.")) return;
    try {
      setSaving(true);
      const created = await createLiquidation(engagementId.trim(), { ...form, montantHT: Number(form.montantHT), tauxTVA: Number(form.tauxTVA) || 0, tauxImpotRetenue: Number(form.tauxImpotRetenue) || 0, detailPrestations: form.detailPrestations || undefined });
      navigate(`/dashboard/gestion-ordonnateur/liquidations/${created.id}`);
    } catch (error) {
      setError(apiErrorMessage(error, "La liquidation n'a pas pu être créée. Vérifiez que l'engagement est confirmé et que le montant est compatible."));
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6">
    <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Chaîne de dépense</p><h1 className="text-2xl font-semibold tracking-tight">Nouvelle liquidation</h1></div><Button type="button" variant="outline" className="gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour</Button></div>
    {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <Card><CardHeader><CardTitle>Références et facture</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2"><Label>UUID de l'engagement confirmé</Label><Input required value={engagementId} onChange={(event) => setEngagementId(event.target.value)} placeholder="UUID de l'engagement" /></div>
      <div className="space-y-2"><Label>Numéro de liquidation</Label><Input required value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} /></div>
      <div className="space-y-2"><Label>Type de facture</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.typeFacture} onChange={(event) => setForm({ ...form, typeFacture: event.target.value })}><option value="COMPLETE">Complète</option><option value="PARTIELLE">Partielle</option><option value="PRO_FORMA">Pro forma</option><option value="AVOIR">Avoir</option><option value="RECTIFICATIVE">Rectificative</option><option value="REGULARISATION">Régularisation</option></select></div>
      <div className="space-y-2"><Label>Numéro de facture</Label><Input required value={form.numeroFacture} onChange={(event) => setForm({ ...form, numeroFacture: event.target.value })} /></div>
      <div className="space-y-2"><Label>Date de facture</Label><Input required type="date" value={form.dateFacture} onChange={(event) => setForm({ ...form, dateFacture: event.target.value })} /></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Montants</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2"><Label>Montant HT</Label><Input required min="0.01" step="0.01" type="number" value={form.montantHT} onChange={(event) => setForm({ ...form, montantHT: event.target.value })} /></div>
      <div className="space-y-2"><Label>TVA (%)</Label><Input min="0" step="0.01" type="number" value={form.tauxTVA} onChange={(event) => setForm({ ...form, tauxTVA: event.target.value })} /></div>
      <div className="space-y-2"><Label>Montant TTC calculé</Label><Input value={`${montantTTC.toLocaleString("fr-FR")} FCFA`} disabled /></div>
      <div className="space-y-2 md:col-span-3"><Label>Détail des prestations</Label><Input value={form.detailPrestations} onChange={(event) => setForm({ ...form, detailPrestations: event.target.value })} placeholder="Description facultative" /></div>
    </CardContent></Card>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button><Button type="submit" disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Créer la liquidation"}</Button></div>
  </form>;
}