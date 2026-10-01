import { useEffect, useState } from "react";
import { RefreshCcw, WalletCards } from "lucide-react";
import { listMyRegies, type RegieRecord } from "@/api/regies.api";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RegiePage() {
  const [regies, setRegies] = useState<RegieRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      setRegies(await listMyRegies());
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Impossible de charger les régies d'avances."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">FC-DEP-006</p>
          <h1 className="text-2xl font-semibold tracking-tight">Régies d'avances</h1>
        </div>
        <Button variant="outline" size="icon" aria-label="Actualiser" onClick={() => void load()} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary" />Mes régies actives</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Chargement des régies...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Plafond</TableHead><TableHead>Engagé</TableHead><TableHead>Disponible</TableHead><TableHead>Périodicité</TableHead><TableHead>État</TableHead></TableRow></TableHeader>
              <TableBody>
                {regies.map((regie) => <TableRow key={regie.id}>
                  <TableCell className="font-mono font-medium">{regie.numeroRegie}</TableCell>
                  <TableCell>{formatCurrency(regie.montantPlafond)}</TableCell>
                  <TableCell>{formatCurrency(regie.montantEngages)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(regie.soldeDisponible)}</TableCell>
                  <TableCell>{regie.periodicite}</TableCell>
                  <TableCell><Badge variant="secondary">{regie.etat}</Badge></TableCell>
                </TableRow>)}
                {regies.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Aucune régie active.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
