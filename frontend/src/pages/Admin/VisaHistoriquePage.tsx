// src/pages/CF/VisasHistoriquePage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileCheck, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { listEngagements } from "@/api/finance.api";
import type { Engagement } from "@/types/budget";
import { apiErrorMessage } from "@/api/api-error";

export default function VisaHistoriquePage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void listEngagements()
      .then((items) => setEngagements(items.filter((item) => ["VISE", "REJET"].includes(item.etat))))
      .catch((requestError) => setError(apiErrorMessage(requestError, "Impossible de charger l'historique des visas.")));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Historique des Visas du Contrôleur Financier
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" /> Traitements Effectués
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Décision</TableHead>
                <TableHead>N° Engagement</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Décision du CF</TableHead>
                <TableHead>Observations / réserves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagements.map((engagement) => <TableRow key={engagement.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(engagement.dateVisa ?? engagement.dateCreation)}
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {engagement.numeroEngagement}
                </TableCell>
                <TableCell>{engagement.objet}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(engagement.montantTTC)}</TableCell>
                <TableCell>
                  {engagement.etat === "REJET"
                    ? <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejet</Badge>
                    : <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3" />{avisLabel(engagement)}</Badge>}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal text-sm text-muted-foreground">{avisDetails(engagement) || engagement.motifRejet || "-"}</TableCell>
              </TableRow>)}
              {engagements.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Aucune décision enregistrée.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value?: string | Date) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}

function avisLabel(engagement: Engagement) {
  const avis = engagement.metadata?.dernierAvisCF;
  if (avis === "VISA_AVEC_OBSERVATIONS") return "Visa avec observations";
  if (avis === "VISA_AVEC_RESERVES") return "Visa avec réserves";
  return "Visa accordé";
}

function avisDetails(engagement: Engagement) {
  const observations = engagement.metadata?.observationsCF;
  const reserves = engagement.metadata?.reservesCF;
  return [observations, reserves]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" · ");
}
