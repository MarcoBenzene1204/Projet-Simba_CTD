// src/pages/Engagements/EngagementsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableCarousel } from "@/components/ui/table-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { confirmEngagement, listEngagements, submitEngagement, validateEngagement } from "@/api/finance.api";
import type { Engagement } from "@/types/budget";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";

export default function EngagementPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { hasPermission } = useAuthorization();
  const navigate = useNavigate();

  async function transition(engagement: Engagement, action: () => Promise<Engagement>, label: string) {
    if (!window.confirm(`Confirmer l'action « ${label} » pour ${engagement.numeroEngagement} ?`)) return;
    try {
      const updated = await action();
      setEngagements((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`));
    }
  }

  useEffect(() => {
    void listEngagements()
      .then(setEngagements)
      .catch((error) => setError(apiErrorMessage(error, "Impossible de charger les engagements.")))
      .finally(() => setLoading(false));
  }, []);

  const visibleEngagements = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return engagements;
    return engagements.filter((engagement) =>
      `${engagement.numeroEngagement} ${engagement.objet} ${engagement.etat}`
        .toLowerCase()
        .includes(query),
    );
  }, [engagements, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Suivi des Engagements Budgétaires
        </h1>
        {hasPermission("engagement:creer") && (
          <Button className="gap-2" onClick={() => navigate("/dashboard/gestion-ordonnateur/engagement/nouveau")}>
            <Plus className="h-4 w-4" /> Créer un Engagement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Journal des
            Engagements
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher N° engagement..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {loading ? <p className="py-8 text-center text-muted-foreground">Chargement des engagements...</p> : <TableCarousel
            columns={["N° Engagement", "Imputation Budgétaire", "Bénéficiaire", "Montant TTC", "Statut Visa", "Action"]}
            rows={visibleEngagements}
            emptyMessage="Aucun engagement trouvé."
            renderRow={(engagement) => <TableRow key={engagement.id}>
                <TableCell className="font-mono font-medium">{engagement.numeroEngagement}</TableCell>
                <TableCell className="font-mono text-xs">{engagement.lignebudgetaireId}</TableCell>
                <TableCell>{engagement.objet}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(engagement.montantTTC)}</TableCell>
                <TableCell><Badge variant="secondary">{engagement.etat}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/gestion-ordonnateur/engagement/${engagement.id}`)}>Détails</Button>
                    {engagement.etat === "BROUILLON" && hasPermission("engagement:soumettre") && <Button size="sm" variant="outline" onClick={() => void transition(engagement, () => submitEngagement(engagement.id), "soumettre")}>Soumettre</Button>}
                    {engagement.etat === "SOUMIS_CF" && hasPermission("engagement:valider") && <Button size="sm" variant="outline" onClick={() => void transition(engagement, () => validateEngagement(engagement.id), "viser")}>Viser</Button>}
                    {engagement.etat === "VISE" && hasPermission("engagement:confirmer") && <Button size="sm" onClick={() => void transition(engagement, () => confirmEngagement(engagement.id), "confirmer")}>Confirmer</Button>}
                  </div>
                </TableCell>
              </TableRow>}
          />
          }
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
