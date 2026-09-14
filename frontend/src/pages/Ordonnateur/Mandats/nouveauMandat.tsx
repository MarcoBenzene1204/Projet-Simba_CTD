import { useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router";
import { createMandat } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NouveauMandat() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();
  const [exerciceId, setExerciceId] = useState("");
  const [typeMandat, setTypeMandat] = useState("INDIVIDUEL");
  const [liquidationIds, setLiquidationIds] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  if (!hasPermission("mandat:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer un mandat.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const ids = liquidationIds.split(/[\s,;]+/).map((id) => id.trim()).filter(Boolean);
    if (!exerciceId.trim() || !ids.length) {
      setError("Renseignez l'exercice et au moins une liquidation.");
      return;
    }
    if (new Set(ids).size !== ids.length) {
      setError("Une liquidation ne peut apparaître qu'une seule fois.");
      return;
    }
    if (!window.confirm("Confirmer la création de ce mandat ? Les liquidations doivent être prêtes pour l'ordonnancement.")) return;
    try {
      setSaving(true);
      const created = await createMandat(exerciceId.trim(), typeMandat, ids);
      navigate(`/dashboard/gestion-ordonnateur/mandats/${created.id}`);
    } catch (error) {
      setError(apiErrorMessage(error, "Le mandat n'a pas pu être créé. Vérifiez les liquidations et leur état."));
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6">
    <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Chaîne de dépense</p><h1 className="text-2xl font-semibold tracking-tight">Nouveau mandat</h1></div><Button type="button" variant="outline" className="gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour</Button></div>
    {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <Card><CardHeader><CardTitle>Paramètres du mandat</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label>UUID de l'exercice</Label><Input required value={exerciceId} onChange={(event) => setExerciceId(event.target.value)} placeholder="UUID de l'exercice" /></div>
      <div className="space-y-2"><Label>Type de mandat</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={typeMandat} onChange={(event) => setTypeMandat(event.target.value)}><option value="INDIVIDUEL">Individuel</option><option value="COLLECTIF">Collectif</option><option value="REGULARISATION">Régularisation</option><option value="RETENUE_GARANTIE">Retenue de garantie</option><option value="REGLEMENT_OFFICE">Règlement d'office</option></select></div>
      <div className="space-y-2 md:col-span-2"><Label>UUID des liquidations</Label><Input required value={liquidationIds} onChange={(event) => setLiquidationIds(event.target.value)} placeholder="Un ou plusieurs UUID séparés par des virgules" /><p className="text-xs text-muted-foreground">Les liquidations doivent être prêtes pour l’ordonnancement et appartenir à votre collectivité.</p></div>
    </CardContent></Card>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button><Button type="submit" disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Créer le mandat"}</Button></div>
  </form>;
}