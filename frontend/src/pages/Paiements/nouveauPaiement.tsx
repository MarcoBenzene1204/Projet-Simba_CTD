import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { createPaiement, listMandatsAProgrammer, type MandatPaiementDisponible } from "@/api/finance.api";
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
  const [mandats, setMandats] = useState<MandatPaiementDisponible[]>([]);
  const [loadingMandats, setLoadingMandats] = useState(true);
  const [modeReglement, setModeReglement] = useState("CAISSE");
  const [dateProgrammee, setDateProgrammee] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const selectedMandat = useMemo(() => mandats.find((item) => item.id === mandatId), [mandats, mandatId]);

  useEffect(() => {
    void listMandatsAProgrammer()
      .then((items) => {
        setMandats(items);
        const selected = items.find((item) => item.id === mandatId) ?? items[0];
        if (selected) {
          setMandatId(selected.id);
          setModeReglement(selected.doubleSignatureRequise ? "VIREMENT_BANCAIRE" : "CAISSE");
        }
      })
      .catch((cause) => setError(apiErrorMessage(cause, "Impossible de charger les mandats transmis au Receveur.")))
      .finally(() => setLoadingMandats(false));
  }, []);

  if (!hasPermission("paiement:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer un paiement.</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!mandatId) { setError("Sélectionnez un mandat transmis au Receveur."); return; }
    if (!dateProgrammee) { setError("La date de programmation est obligatoire."); return; }
    if (!window.confirm("Confirmer la création du paiement ? Le montant sera calculé par le serveur.")) return;
    try {
      setSaving(true);
      const created = await createPaiement(mandatId, modeReglement, dateProgrammee);
      navigate(`/dashboard/paiements/${created.id}`);
    } catch (error) { setError(apiErrorMessage(error, "Le paiement n'a pas pu être créé. Vérifiez que le mandat est transmis au receveur et qu'aucun paiement n'existe déjà.")); }
    finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Exécution financière</p><h1 className="text-2xl font-semibold tracking-tight">Nouveau paiement</h1></div><Button type="button" variant="outline" className="gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour</Button></div>{error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {!loadingMandats && mandats.length === 0 && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Aucun mandat transmis et disponible pour programmation.</p>}
    <Card><CardHeader><CardTitle>Paramètres du règlement</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label htmlFor="mandat-select">Mandat transmis</Label><select id="mandat-select" required disabled={loadingMandats || mandats.length === 0} value={mandatId} className="h-10 w-full rounded-md border bg-background px-3 text-sm" onChange={(event) => { const selected = mandats.find((item) => item.id === event.target.value); setMandatId(event.target.value); if (selected) setModeReglement(selected.doubleSignatureRequise ? "VIREMENT_BANCAIRE" : "CAISSE"); }}><option value="">{loadingMandats ? "Chargement des mandats…" : "Sélectionner un mandat"}</option>{mandats.map((mandat) => <option key={mandat.id} value={mandat.id}>{mandat.numeroMandat} · {mandat.typeMandat.replaceAll("_", " ")} · {formatCurrency(mandat.montantTTCMandate)}</option>)}</select></div><div className="space-y-2"><Label htmlFor="mode-reglement">Mode de règlement</Label><select id="mode-reglement" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={modeReglement} onChange={(event) => setModeReglement(event.target.value)}><option value="CAISSE" disabled={selectedMandat?.doubleSignatureRequise}>Caisse</option><option value="CHEQUE" disabled={!selectedMandat?.doubleSignatureRequise}>Chèque</option><option value="VIREMENT_BANCAIRE" disabled={!selectedMandat?.doubleSignatureRequise}>Virement bancaire</option></select></div><div className="space-y-2"><Label htmlFor="date-programmee">Date programmée</Label><Input id="date-programmee" required type="date" min={new Date().toISOString().slice(0, 10)} value={dateProgrammee} onChange={(event) => setDateProgrammee(event.target.value)} /></div></CardContent></Card>
    {selectedMandat && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Montant du mandat : {formatCurrency(selectedMandat.montantTTCMandate)}. Le net à payer est calculé depuis les liquidations. {selectedMandat.doubleSignatureRequise ? "Une double signature est requise pour ce paiement." : "Paiement en caisse selon le seuil applicable."}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button><Button type="submit" disabled={saving || loadingMandats || mandats.length === 0} className="gap-2"><Save className="h-4 w-4" />{saving ? "Enregistrement..." : "Programmer le paiement"}</Button></div></form>;
}

function formatCurrency(value: number) { return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`; }