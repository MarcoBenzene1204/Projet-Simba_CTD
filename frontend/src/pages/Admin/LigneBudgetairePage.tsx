// src/pages/Referentiel/LignesBudgetairesPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent } from "react";

export default function LignesBudgetairePage() {
  const [open, setOpen] = useState(false);
  const [lignes, setLignes] = useState([{ code: "61-10-100", libelle: "Fournitures de bureau et consommables" }]);
  const [form, setForm] = useState({ code: "", libelle: "" });
  const ajouter = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLignes((current) => [...current, form]); setForm({ code: "", libelle: "" }); setOpen(false); };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Lignes Budgétaires (Nomenclature M5)
        </h1>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle Ligne
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Crédits & Consommation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code Imputation</TableHead>
                <TableHead>Libellé de la Ligne</TableHead>
                <TableHead>Crédit Voté</TableHead>
                <TableHead>Crédit Engagé</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Taux</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lignes.map((ligne) => <TableRow key={ligne.code}>
                <TableCell className="font-mono font-medium">
                  {ligne.code}
                </TableCell>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell>15 000 000 FCFA</TableCell>
                <TableCell className="text-amber-600">9 300 000 FCFA</TableCell>
                <TableCell className="font-bold text-emerald-600">
                  5 700 000 FCFA
                </TableCell>
                <TableCell className="w-32">
                  <div className="space-y-1">
                    <span className="text-xs font-medium">62%</span>
                    <Progress value={62} />
                  </div>
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><form onSubmit={ajouter} className="w-full max-w-lg space-y-4 rounded-xl bg-background p-6 shadow-xl"><h2 className="text-xl font-semibold">Nouvelle ligne budgétaire</h2><Input required placeholder="Code d’imputation" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /><Input required placeholder="Libellé de la ligne" value={form.libelle} onChange={(event) => setForm({ ...form, libelle: event.target.value })} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div></form></div>}
    </div>
  );
}
