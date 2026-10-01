// src/pages/CF/VisasAttentePage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Clock, FileCheck2, MessageSquareText, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { decideEngagementVisa, listEngagements, rejectEngagement, type EngagementAvis } from "@/api/finance.api";
import type { Engagement } from "@/types/budget";
import { apiErrorMessage } from "@/api/api-error";
import { useAuthorization } from "@/auth/useAuthorization";

type DecisionType = EngagementAvis | "REJET";

const decisions: { value: DecisionType; label: string; description: string; Icon: typeof Check }[] = [
  { value: "VISA", label: "Visa", description: "Accord sans observation.", Icon: Check },
  { value: "VISA_AVEC_OBSERVATIONS", label: "Avec observations", description: "Accord assorti de points à corriger.", Icon: MessageSquareText },
  { value: "VISA_AVEC_RESERVES", label: "Avec réserves", description: "Accord sous réserve explicite.", Icon: ShieldAlert },
  { value: "REJET", label: "Rejet", description: "Refus motivé du dossier.", Icon: X },
];

export default function VisasAttentePage() {
  const { hasPermission } = useAuthorization();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [error, setError] = useState<string>();
  const [decisionTarget, setDecisionTarget] = useState<Engagement>();
  const [decisionType, setDecisionType] = useState<DecisionType>("VISA");
  const [decisionDetails, setDecisionDetails] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);

  async function load() {
    try {
      setError(undefined);
      setEngagements((await listEngagements()).filter((item) => item.etat === "SOUMIS_CF"));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Impossible de charger les dossiers en attente."));
    }
  }

  useEffect(() => { void load(); }, []);

  async function decide() {
    if (!decisionTarget) return;
    const needsDetails = decisionType !== "VISA";
    if (needsDetails && !decisionDetails.trim()) {
      setError(decisionType === "REJET" ? "Le motif du rejet est obligatoire." : "Les détails de cette décision sont obligatoires.");
      return;
    }
    try {
      setSavingDecision(true);
      setError(undefined);
      const updated = decisionType === "REJET"
        ? await rejectEngagement(decisionTarget.id, decisionDetails.trim())
        : await decideEngagementVisa(decisionTarget.id, decisionType, decisionDetails.trim() || undefined);
      setEngagements((current) => current.filter((item) => item.id !== updated.id));
      setDecisionTarget(undefined);
      setDecisionDetails("");
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "La décision n'a pas pu être enregistrée."));
    } finally {
      setSavingDecision(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Dossiers en Attente de Visa
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Instances à Traiter
            (Visa Préalable)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Engagement</TableHead>
                <TableHead>Type d'engagement</TableHead>
                <TableHead>Objet de la Dépense</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagements.map((engagement) => <TableRow key={engagement.id}>
                <TableCell className="font-mono font-medium">
                  {engagement.numeroEngagement}
                </TableCell>
                <TableCell>{engagement.typeEngagement}</TableCell>
                <TableCell>{engagement.objet}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(engagement.montantTTC)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {(hasPermission("engagement:valider") || hasPermission("engagement:rejeter")) && <Button size="sm" variant="outline" className="gap-1" onClick={() => { setDecisionTarget(engagement); setDecisionType("VISA"); setDecisionDetails(""); }}><FileCheck2 className="h-4 w-4" />Décider</Button>}
                </TableCell>
              </TableRow>)}
              {engagements.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Aucun dossier en attente.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(decisionTarget)} onOpenChange={(open) => { if (!open && !savingDecision) setDecisionTarget(undefined); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Décision du contrôle financier</DialogTitle>
            <DialogDescription>{decisionTarget?.numeroEngagement} · {decisionTarget?.objet}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Issue de l’examen</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {decisions.filter((decision) => decision.value === "REJET"
                  ? hasPermission("engagement:rejeter")
                  : hasPermission("engagement:valider"))
                  .map(({ value, label, description, Icon }) => (
                    <button key={value} type="button" aria-pressed={decisionType === value} onClick={() => { setDecisionType(value); setError(undefined); }} className={`flex min-w-0 items-start gap-3 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${decisionType === value ? "border-primary bg-primary/5" : "hover:bg-muted/60"}`}>
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${value === "REJET" ? "text-destructive" : "text-primary"}`} />
                      <span className="min-w-0"><span className="block text-sm font-medium">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span>
                    </button>
                  ))}
              </div>
            </fieldset>
            {decisionType !== "VISA" && <label className="grid gap-2 text-sm font-medium" htmlFor="decision-details">{decisionType === "REJET" ? "Motif du rejet" : decisionType === "VISA_AVEC_OBSERVATIONS" ? "Observations" : "Réserves"}<Textarea id="decision-details" required maxLength={2000} rows={4} value={decisionDetails} onChange={(event) => setDecisionDetails(event.target.value)} placeholder={decisionType === "REJET" ? "Préciser le motif réglementaire du rejet…" : "Décrire les éléments à corriger ou les réserves…"} /></label>}
            {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionTarget(undefined)} disabled={savingDecision}>Annuler</Button>
            <Button onClick={() => void decide()} disabled={savingDecision || (decisionType !== "VISA" && !decisionDetails.trim())} variant={decisionType === "REJET" ? "destructive" : "default"}>{savingDecision ? "Enregistrement…" : decisionType === "REJET" ? "Confirmer le rejet" : "Enregistrer la décision"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
