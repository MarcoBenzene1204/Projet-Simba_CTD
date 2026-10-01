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
import { useEffect, useState, type FormEvent } from "react";
import { createLigneBudgetaire, listLignesBudgetaires, type LigneBudgetaireReference } from "@/api/finance.api";
import { apiErrorMessage } from "@/api/api-error";
import { useAuth } from "@/auth/AuthContext";

export default function LignesBudgetairePage() {
  const { role } = useAuth();
  const canCreate = role === "ADMINISTRATEUR" || role === "ORDONNATEUR";
  const [open, setOpen] = useState(false);
  const [lignes, setLignes] = useState<LigneBudgetaireReference[]>([]);
  const [form, setForm] = useState({ code: "", libelle: "", creditVote: "" });
  const [error, setError] = useState<string>();
  useEffect(() => { void listLignesBudgetaires().then(setLignes).catch((requestError) => setError(apiErrorMessage(requestError, "Impossible de charger les lignes budgétaires."))); }, []);
  const ajouter = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { const created = await createLigneBudgetaire({ code: form.code, libelle: form.libelle, creditVote: Number(form.creditVote) || 0 }); setLignes((current) => [...current, created]); setForm({ code: "", libelle: "", creditVote: "" }); setOpen(false); } catch (requestError) { setError(apiErrorMessage(requestError, "La ligne budgétaire n'a pas pu être enregistrée.")); } };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Lignes Budgétaires (Nomenclature M5)
        </h1>
        {canCreate && (
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle Ligne
          </Button>
        )}
      </div>
      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

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
              {lignes.map((ligne) => <TableRow key={ligne.id}>
                <TableCell className="font-mono font-medium">
                  {ligne.code}
                </TableCell>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell>{formatCurrency(ligne.creditVote)}</TableCell>
                <TableCell className="text-amber-600">{formatCurrency(ligne.creditEngage)}</TableCell>
                <TableCell className="font-bold text-emerald-600">
                  {formatCurrency((ligne.creditVote ?? 0) - (ligne.creditEngage ?? 0))}
                </TableCell>
                <TableCell className="w-32">
                  <div className="space-y-1">
                    <span className="text-xs font-medium">{Math.round(((ligne.creditEngage ?? 0) / Math.max(ligne.creditVote ?? 1, 1)) * 100)}%</span>
                    <Progress value={Math.min(((ligne.creditEngage ?? 0) / Math.max(ligne.creditVote ?? 1, 1)) * 100, 100)} />
                  </div>
                </TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {canCreate && open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><form onSubmit={ajouter} className="w-full max-w-lg space-y-4 rounded-xl bg-background p-6 shadow-xl"><h2 className="text-xl font-semibold">Nouvelle ligne budgétaire</h2><Input required placeholder="Code d’imputation" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /><Input required placeholder="Libellé de la ligne" value={form.libelle} onChange={(event) => setForm({ ...form, libelle: event.target.value })} /><Input type="number" min="0" placeholder="Crédit voté" value={form.creditVote} onChange={(event) => setForm({ ...form, creditVote: event.target.value })} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div></form></div>}
    </div>
  );
}

function formatCurrency(value?: number) { return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`; }
