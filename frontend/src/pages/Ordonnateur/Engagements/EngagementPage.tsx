// src/pages/Engagements/EngagementsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock3, FileText, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { confirmEngagement, listEngagements, rejectEngagement, submitEngagement, validateEngagement } from "@/api/finance.api";
import type { Engagement } from "@/types/budget";
import { useAuth } from "@/auth/AuthContext";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";

interface EngagementPageProps {
  modeControleur?: boolean;
}

export default function EngagementPage({ modeControleur = false }: EngagementPageProps) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { role } = useAuth();
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
    const query = search.trim().toLocaleLowerCase("fr-FR");
    return engagements.filter((engagement) => {
      const matchesQuery = !query || `${engagement.numeroEngagement} ${engagement.objet} ${engagement.etat} ${engagement.typeEngagement}`
        .toLocaleLowerCase("fr-FR")
        .includes(query);
      return matchesQuery && (statusFilter === "ALL" || engagement.etat === statusFilter);
    });
  }, [engagements, search, statusFilter]);

  const pendingCount = engagements.filter((item) => item.etat === "SOUMIS_CF").length;
  const validatedCount = engagements.filter((item) => item.etat === "VISE" || item.etat === "CONFIRME").length;
  const rejectedCount = engagements.filter((item) => item.etat === "REJET").length;
  const detailBase = modeControleur ? "/dashboard/controleur/engagements" : "/dashboard/gestion-ordonnateur/engagement";

  return (
      <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{modeControleur ? "Contrôle financier" : "Chaîne de dépense"}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Suivi des engagements</h1>
          <p className="mt-1 text-sm text-muted-foreground">{modeControleur ? "Consultez l’état des dossiers et intervenez sur les engagements soumis à votre visa." : "Consultez l’avancement des engagements budgétaires."}</p>
        </div>
        {role === "ORDONNATEUR" && hasPermission("engagement:creer") && (
          <Button className="gap-2" onClick={() => navigate("/dashboard/gestion-ordonnateur/engagement/nouveau")}>
            <Plus className="h-4 w-4" /> Créer un Engagement
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between gap-3 p-4"><div><p className="text-xs text-muted-foreground">{modeControleur ? "À contrôler" : "Soumis au contrôle"}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{pendingCount}</p></div><Clock3 className="h-5 w-5 text-amber-700" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between gap-3 p-4"><div><p className="text-xs text-muted-foreground">Visés</p><p className="mt-1 text-2xl font-semibold tabular-nums">{validatedCount}</p></div><Check className="h-5 w-5 text-emerald-700" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between gap-3 p-4"><div><p className="text-xs text-muted-foreground">Rejetés</p><p className="mt-1 text-2xl font-semibold tabular-nums">{rejectedCount}</p></div><X className="h-5 w-5 text-destructive" /></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-primary" />Dossiers ({visibleEngagements.length})</CardTitle>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="N°, objet ou type..." className="pl-8" />
          </div>
          <label className="sr-only" htmlFor="engagement-status-filter">Filtrer par statut</label>
          <select id="engagement-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-48">
            <option value="ALL">Tous les statuts</option>
              <option value="SOUMIS_CF">Soumis au contrôle</option>
            <option value="VISE">Visé</option>
            <option value="REJET">Rejeté</option>
            <option value="CONFIRME">Confirmé</option>
          </select>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {loading ? <p className="py-8 text-center text-muted-foreground">Chargement des engagements...</p> : visibleEngagements.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Aucun engagement ne correspond à ces critères.</p> : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader><TableRow><TableHead>N° / date</TableHead><TableHead>Type</TableHead><TableHead>Objet</TableHead><TableHead>Imputation</TableHead><TableHead className="text-right">Montant TTC</TableHead><TableHead>État</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{visibleEngagements.map((engagement) => <TableRow key={engagement.id}>
                    <TableCell><div className="font-mono font-medium">{engagement.numeroEngagement}</div><div className="text-xs text-muted-foreground">{formatDate(engagement.dateEngagement)}</div></TableCell>
                    <TableCell className="whitespace-normal">{formatType(engagement.typeEngagement)}</TableCell>
                    <TableCell className="max-w-[280px] whitespace-normal"><span className="line-clamp-2">{engagement.objet}</span></TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">{engagement.lignebudgetaireId}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(engagement.montantTTC)}</TableCell>
                    <TableCell><StatusBadge status={engagement.etat} /></TableCell>
                    <TableCell><div className="flex justify-end gap-1">{renderActions(engagement, detailBase, modeControleur, role, hasPermission, navigate, transition)}</div></TableCell>
                  </TableRow>)}</TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {visibleEngagements.map((engagement) => <Card key={engagement.id} className="min-w-0 border-border/80 shadow-none">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="break-all font-mono text-sm font-semibold">{engagement.numeroEngagement}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(engagement.dateEngagement)} · {formatType(engagement.typeEngagement)}</p></div><StatusBadge status={engagement.etat} /></div>
                    <p className="line-clamp-3 text-sm leading-5">{engagement.objet}</p>
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground"><span>Imputation <span className="font-mono text-foreground">{engagement.lignebudgetaireId}</span></span><span className="font-semibold tabular-nums text-foreground">{formatCurrency(engagement.montantTTC)}</span></div>
                    <div className="flex flex-wrap gap-2 border-t pt-3">{renderActions(engagement, detailBase, modeControleur, role, hasPermission, navigate, transition)}</div>
                  </CardContent>
                </Card>)}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function renderActions(
  engagement: Engagement,
  detailBase: string,
  modeControleur: boolean,
  role: ReturnType<typeof useAuth>["role"],
  hasPermission: ReturnType<typeof useAuthorization>["hasPermission"],
  navigate: ReturnType<typeof useNavigate>,
  transition: (engagement: Engagement, action: () => Promise<Engagement>, label: string) => Promise<void>,
) {
  return <>
    <Button size="sm" variant="outline" onClick={() => navigate(`${detailBase}/${engagement.id}`)}>Détails</Button>
    {modeControleur && engagement.etat === "SOUMIS_CF" && hasPermission("engagement:valider") && <Button size="sm" className="gap-1" onClick={() => void transition(engagement, () => validateEngagement(engagement.id), "viser")}><Check className="h-4 w-4" />Viser</Button>}
    {modeControleur && engagement.etat === "SOUMIS_CF" && hasPermission("engagement:rejeter") && <Button size="sm" variant="destructive" className="gap-1" onClick={() => void transition(engagement, () => rejectEngagement(engagement.id, "Dossier rejeté après contrôle financier"), "rejeter")}><X className="h-4 w-4" />Rejeter</Button>}
    {!modeControleur && engagement.etat === "BROUILLON" && role === "ORDONNATEUR" && hasPermission("engagement:soumettre") && <Button size="sm" variant="outline" onClick={() => void transition(engagement, () => submitEngagement(engagement.id), "soumettre")}>Soumettre</Button>}
    {!modeControleur && engagement.etat === "VISE" && role === "ORDONNATEUR" && hasPermission("engagement:confirmer") && <Button size="sm" onClick={() => void transition(engagement, () => confirmEngagement(engagement.id), "confirmer")}>Confirmer</Button>}
  </>;
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "REJET" ? "destructive" : status === "VISE" || status === "CONFIRME" ? "default" : "secondary";
  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}

function formatDate(value?: Date | string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
}

function formatType(value: string) {
  return value.replaceAll("_", " ").replaceAll("DE COMMANDE", "de commande");
}


function formatCurrency(value: number | undefined) {
  return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
