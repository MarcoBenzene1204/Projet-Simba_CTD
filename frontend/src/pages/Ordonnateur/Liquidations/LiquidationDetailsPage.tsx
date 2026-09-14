import { ArrowLeft, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getLiquidation, type LiquidationRecord } from "@/api/finance.api";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflow = [
  { label: "Brouillon", state: "BROUILLON" },
  { label: "Soumise au CF", state: "SOUMISE_CF" },
  { label: "Validée", state: "VALIDEE_CF" },
  { label: "Prête à ordonnancer", state: "PRETE_ORDONNANCEMENT" },
];

export default function LiquidationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<LiquidationRecord>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;
    void getLiquidation(id).then(setItem).catch(() => setError("Liquidation introuvable ou inaccessible."));
  }, [id]);

  if (error || !item) return <div className="space-y-4"><p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error ?? "Chargement de la liquidation..."}</p><Button variant="outline" onClick={() => navigate(-1)}>Retour</Button></div>;

  return <div className="space-y-6">
    <Button variant="ghost" className="-ml-3 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour aux liquidations</Button>
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm text-muted-foreground">Fiche liquidation</p><h1 className="text-2xl font-semibold tracking-tight">{item.numero}</h1><p className="mt-1 text-muted-foreground">Facture {item.numeroFacture}</p></div><Badge variant="secondary">{item.etat}</Badge></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" />Progression du workflow</CardTitle></CardHeader><CardContent><WorkflowStepper steps={workflow} currentState={item.etat} /></CardContent></Card>
    <Card><CardHeader><CardTitle>Informations financières</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><Info label="Montant HT" value={formatCurrency(item.montantHT)} /><Info label="Montant TTC" value={formatCurrency(item.montantTTC)} /><Info label="Montant net à payer" value={formatCurrency(item.montantNAP)} /><Info label="Engagement" value={item.engagement?.numeroEngagement ?? "-"} /><Info label="Service fait" value={item.serviceFaitAt ? "Attesté" : "Non attesté"} /><Info label="Conformité fiscale" value={item.conformiteFiscale ? "Conforme" : "À vérifier"} /></CardContent></Card>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>; }
function formatCurrency(value: number | undefined) { return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`; }