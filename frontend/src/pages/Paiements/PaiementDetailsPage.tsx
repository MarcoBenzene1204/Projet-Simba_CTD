import { ArrowLeft, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getPaiement, type PaiementRecord } from "@/api/finance.api";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflow = [
  { label: "Programmé", state: "PROGRAMME" },
  { label: "En cours", state: "EN_COURS" },
  { label: "Exécuté", state: "EXECUTE" },
];

export default function PaiementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<PaiementRecord>();
  const [error, setError] = useState<string>();

  useEffect(() => { if (id) void getPaiement(id).then(setItem).catch(() => setError("Paiement introuvable ou inaccessible.")); }, [id]);
  if (error || !item) return <div className="space-y-4"><p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error ?? "Chargement du paiement..."}</p><Button variant="outline" onClick={() => navigate(-1)}>Retour</Button></div>;

  return <div className="space-y-6"><Button variant="ghost" className="-ml-3 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour aux paiements</Button><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm text-muted-foreground">Fiche paiement</p><h1 className="text-2xl font-semibold tracking-tight">{item.numeroPaiement}</h1><p className="mt-1 text-muted-foreground">{item.modeReglement}</p></div><Badge variant="secondary">{item.statut}</Badge></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Progression du règlement</CardTitle></CardHeader><CardContent><WorkflowStepper steps={workflow} currentState={item.statut} /></CardContent></Card><Card><CardHeader><CardTitle>Informations du paiement</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><Info label="Montant TTC" value={formatCurrency(item.montantTTC)} /><Info label="Net payé" value={formatCurrency(item.montantNetPaye)} /><Info label="Date programmée" value={item.dateProgrammee ? new Date(item.dateProgrammee).toLocaleDateString("fr-FR") : "-"} /><Info label="Date d'exécution" value={item.dateExecution ? new Date(item.dateExecution).toLocaleDateString("fr-FR") : "-"} /><Info label="Référence bancaire" value={item.referenceBancaire ?? "-"} /></CardContent></Card></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>; }
function formatCurrency(value: number | undefined) { return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`; }