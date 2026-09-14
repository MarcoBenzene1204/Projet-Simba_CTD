import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getEngagement } from "@/api/finance.api";
import type { Engagement } from "@/types/budget";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflow = [
  { label: "Brouillon", state: "BROUILLON" },
  { label: "Soumis au CF", state: "SOUMIS_CF" },
  { label: "Visé", state: "VISE" },
  { label: "Confirmé", state: "CONFIRME" },
];

export default function EngagementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<Engagement>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) {
      setError("Identifiant d'engagement manquant.");
      setLoading(false);
      return;
    }
    void getEngagement(id)
      .then(setEngagement)
      .catch(() => setError("Engagement introuvable ou inaccessible."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-10 text-center text-muted-foreground">Chargement de l'engagement...</p>;
  if (error || !engagement) return <div className="space-y-4"><p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error ?? "Engagement introuvable."}</p><Button variant="outline" onClick={() => navigate(-1)}>Retour</Button></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="-ml-3 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour aux engagements</Button>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm text-muted-foreground">Fiche engagement</p><h1 className="text-2xl font-semibold tracking-tight">{engagement.numeroEngagement}</h1><p className="mt-1 text-muted-foreground">{engagement.objet}</p></div><Badge variant="secondary" className="w-fit">{engagement.etat}</Badge></div>
      <Card><CardHeader><CardTitle>Progression du workflow</CardTitle></CardHeader><CardContent><WorkflowStepper steps={workflow} currentState={engagement.etat} /></CardContent></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Informations financières</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Info label="Montant HT" value={formatCurrency(engagement.montantHT)} /><Info label="TVA" value={formatCurrency(engagement.montantTVA)} /><Info label="Montant TTC" value={formatCurrency(engagement.montantTTC)} /><Info label="Crédits réservés" value={engagement.creditsReserves ? "Oui" : "Non"} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Références métier</CardTitle></CardHeader><CardContent className="grid gap-4"><Info label="Type" value={engagement.typeEngagement} /><Info label="Exercice" value={engagement.dateEngagement ? new Date(engagement.dateEngagement).toLocaleDateString("fr-FR") : "-"} /><Info label="Ligne budgétaire" value={engagement.lignebudgetaireId} /><Info label="Document préparatoire" value={engagement.documentM5Id || "-"} /></CardContent></Card>
      </div>
      {engagement.etat === "REJET" && <Card className="border-destructive/30"><CardContent className="flex gap-3 pt-6 text-sm text-destructive"><CheckCircle2 className="h-5 w-5 shrink-0" /><span>{engagement.motifRejet ?? "Cet engagement a été rejeté."}</span></CardContent></Card>}
      <Link to="/dashboard/gestion-ordonnateur/engagement" className="sr-only">Retour à la liste</Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>;
}

function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}