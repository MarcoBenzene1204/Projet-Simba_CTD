// src/pages/CF/VisasAttentePage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Clock, X } from "lucide-react";

export default function VisasAttentePage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Engagement</TableHead>
                <TableHead>Bénéficiaire (Tiers)</TableHead>
                <TableHead>Objet de la Dépense</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono font-medium">
                  ENG-2026-0091
                </TableCell>
                <TableCell>BTP CAMEROUN SARL</TableCell>
                <TableCell>Réhabilitation du bâtiment municipal</TableCell>
                <TableCell className="font-semibold">18 500 000 FCFA</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-emerald-600 border-emerald-600"
                  >
                    <Check className="h-4 w-4" /> Accorder Visa
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1">
                    <X className="h-4 w-4" /> Refuser / Rejeter
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
