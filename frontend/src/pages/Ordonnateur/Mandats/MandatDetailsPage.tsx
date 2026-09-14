import { ArrowLeft, FileCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMandat, type MandatRecord } from "@/api/finance.api";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflow = [
  { label: "Brouillon", state: "BROUILLON" },
  { label: "Soumis au CF", state: "SOUMIS_CF" },
  { label: "Visé", state: "VISE_CF" },
  { label: "Transmis au receveur", state: "TRANSMIS_RECEVEUR" },
];

export default function MandatDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<MandatRecord>();
  const [error, setError] = useState<string>();

  useEffect(() => { if (id) void getMandat(id).then(setItem).catch(() => setError("Mandat introuvable ou inaccessible.")); }, [id]);
  if (error || !item) return <div className="space-y-4"><p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error ?? "Chargement du mandat..."}</p><Button variant="outline" onClick={() => navigate(-1)}>Retour</Button></div>;

  return <div className="space-y-6"><Button variant="ghost" className="-ml-3 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Retour aux mandats</Button><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-sm text-muted-foreground">Fiche mandat</p><h1 className="text-2xl font-semibold tracking-tight">{item.numeroMandat}</h1><p className="mt-1 text-muted-foreground">{item.typeMandat}</p></div><Badge variant="secondary">{item.etat}</Badge></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Progression du workflow</CardTitle></CardHeader><CardContent><WorkflowStepper steps={workflow} currentState={item.etat} /></CardContent></Card><Card><CardHeader><CardTitle>Informations du mandat</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><Info label="Montant mandaté" value={formatCurrency(item.montantTTCMandate)} /><Info label="Date" value={new Date(item.dateMandatement).toLocaleDateString("fr-FR")} /><Info label="Bordereau" value={item.numeroBordereau ?? "-"} /></CardContent></Card></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>; }
function formatCurrency(value: number | undefined) { return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`; }