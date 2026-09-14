import { useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { createPaiement } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NouveauPaiement() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasPermission } = useAuthorization();
  const [mandatId, setMandatId] = useState(params.get("mandatId") ?? "");
  const [modeReglement, setModeReglement] = useState("VIREMENT_BANCAIRE");
  const [dateProgrammee, setDateProgrammee] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  if (!hasPermission("paiement:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer un paiement.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!mandatId.trim()) { setError("Renseignez l'UUID du mandat transmis au receveur."); return; }
    if (!window.confirm("Confirmer la création du paiement ? Le montant sera calculé par le serveur.")) return;
    try {
      setSaving(true);
      const created = await createPaiement(mandatId.trim(), modeReglement, dateProgrammee || undefined);
      navigate(`/dashboard/gestion-ordonnateur/paiements/${created.id}`);
    } catch (error) { setError(apiErrorMessage(error, "Le paiement n'a pas pu être créé. Vérifiez que le mandat est transmis au receveur et qu'aucun paiement n'existe déjà.")); }
    finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Exécution financière</p><h1 className="text-2xl font-semibold tracking-tight">Nouveau paiement</h1></div><Button type="button" variant="outline" className="gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour</Button></div>{error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Card><CardHeader><CardTitle>Paramètres du règlement</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label>UUID du mandat transmis</Label><Input required value={mandatId} onChange={(event) => setMandatId(event.target.value)} placeholder="UUID du mandat" /></div><div className="space-y-2"><Label>Mode de règlement</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={modeReglement} onChange={(event) => setModeReglement(event.target.value)}><option value="VIREMENT_BANCAIRE">Virement bancaire</option><option value="CHEQUE">Chèque</option><option value="CAISSE">Caisse</option></select></div><div className="space-y-2"><Label>Date programmée</Label><Input type="date" value={dateProgrammee} onChange={(event) => setDateProgrammee(event.target.value)} /></div></CardContent></Card><p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Le montant TTC et le montant net à payer sont déterminés par le backend à partir du mandat.</p><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button><Button type="submit" disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Créer le paiement"}</Button></div></form>;
}