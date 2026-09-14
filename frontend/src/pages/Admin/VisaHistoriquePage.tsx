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

export default function VisaHistoriquePage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Décision</TableHead>
                <TableHead>N° Engagement</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead className="text-right">Résultat Visa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm text-muted-foreground">
                  18/08/2026
                </TableCell>
                <TableCell className="font-mono font-medium">
                  ENG-2026-0034
                </TableCell>
                <TableCell>Travaux d'entretien de la mairie</TableCell>
                <TableCell className="font-semibold">8 200 000 FCFA</TableCell>
                <TableCell className="text-right">
                  <Badge className="bg-success text-success-foreground gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Accordé
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm text-muted-foreground">
                  15/08/2026
                </TableCell>
                <TableCell className="font-mono font-medium">
                  ENG-2026-0021
                </TableCell>
                <TableCell>Achat de carburant</TableCell>
                <TableCell className="font-semibold">2 000 000 FCFA</TableCell>
                <TableCell className="text-right">
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" /> Refusé
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
