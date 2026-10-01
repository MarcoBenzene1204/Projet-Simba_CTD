import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router";
import { createMandat, getExerciceCourant, listLiquidationsDisponiblesPourMandat, type LiquidationRecord } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NouveauMandat() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();
  const [exercice, setExercice] = useState<{ id: string; annee: number }>();
  const [liquidations, setLiquidations] = useState<LiquidationRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [typeMandat, setTypeMandat] = useState("INDIVIDUEL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void Promise.all([getExerciceCourant(), listLiquidationsDisponiblesPourMandat()])
      .then(([currentExercice, availableLiquidations]) => {
        setExercice({ id: currentExercice.id, annee: currentExercice.annee });
        setLiquidations(availableLiquidations);
      })
      .catch((loadError) => setError(apiErrorMessage(loadError, "Impossible de charger les liquidations prêtes pour l'ordonnancement.")))
      .finally(() => setLoading(false));
  }, []);

  if (!hasPermission("mandat:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer un mandat.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!exercice?.id || !selectedIds.length) {
      setError("Sélectionnez au moins une liquidation prête pour l'ordonnancement.");
      return;
    }
    if (!window.confirm("Confirmer la création de ce mandat ? Les liquidations doivent être prêtes pour l'ordonnancement.")) return;
    try {
      setSaving(true);
      const created = await createMandat(exercice.id, typeMandat, selectedIds);
      navigate(`/dashboard/gestion-ordonnateur/mandats/${created.id}`);
    } catch (error) {
      setError(apiErrorMessage(error, "Le mandat n'a pas pu être créé. Vérifiez les liquidations et leur état."));
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6">
    <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Chaîne de dépense</p><h1 className="text-2xl font-semibold tracking-tight">Nouveau mandat</h1></div><Button type="button" variant="outline" className="gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour</Button></div>
    {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <Card><CardHeader><CardTitle>Paramètres du mandat</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label>Exercice budgétaire</Label><Input value={loading ? "Chargement..." : `Exercice ${exercice?.annee ?? "indisponible"}`} readOnly /></div>
      <div className="space-y-2"><Label>Type de mandat</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={typeMandat} onChange={(event) => setTypeMandat(event.target.value)}><option value="INDIVIDUEL">Individuel</option><option value="COLLECTIF">Collectif</option><option value="REGULARISATION">Régularisation</option><option value="RETENUE_GARANTIE">Retenue de garantie</option><option value="REGLEMENT_OFFICE">Règlement d'office</option></select></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Liquidations disponibles</CardTitle></CardHeader><CardContent className="space-y-3">
      {loading ? <p className="py-6 text-center text-muted-foreground">Chargement des liquidations...</p> : liquidations.length === 0 ? <p className="py-6 text-center text-muted-foreground">Aucune liquidation non mandatée ne remplit les conditions requises.</p> : <div className="divide-y">
        {liquidations.map((liquidation) => {
          const selected = selectedIds.includes(liquidation.id);
          return <label key={liquidation.id} className="flex cursor-pointer items-start gap-3 py-3">
            <input type="checkbox" checked={selected} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, liquidation.id] : current.filter((id) => id !== liquidation.id))} className="mt-1 size-4 accent-primary" />
            <span className="grid flex-1 gap-1 sm:grid-cols-[1fr_auto]">
              <span className="font-medium">{liquidation.numero} · {liquidation.engagement?.numeroEngagement ?? "Engagement"}</span>
              <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(liquidation.montantTTC)} FCFA</span>
              <span className="text-sm text-muted-foreground">Facture {liquidation.numeroFacture}</span>
            </span>
          </label>;
        })}
      </div>}
    </CardContent></Card>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button><Button type="submit" disabled={saving || loading || !selectedIds.length} className="gap-2"><Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Créer le mandat"}</Button></div>
  </form>;
}