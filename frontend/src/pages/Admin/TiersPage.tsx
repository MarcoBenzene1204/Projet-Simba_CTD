import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { Button } from "@/components/ui/button";
import { Building, Ban, Plus, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/tenant/TenantContext";
import { createTiers, desactiverTiers, listTiers, type FournisseurReference } from "@/api/finance.api";
import { apiErrorMessage } from "@/api/api-error";
import { useAuthorization } from "@/auth/useAuthorization";

export default function TiersPage() {
  const { currentTenant } = useTenant();
  const { hasPermission } = useAuthorization();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tiers, setTiers] = useState<FournisseurReference[]>([]);
  const [form, setForm] = useState({ code: "", nom: "", niu: "", rib: "" });
  const [error, setError] = useState<string>();

  useEffect(() => {
    void listTiers().then(setTiers).catch((requestError) => setError(apiErrorMessage(requestError, "Impossible de charger les tiers.")));
  }, [currentTenant?.id]);

  const visibleTiers = useMemo(() => {
    return tiers.filter((tier) => {
      const query = search.toLowerCase();
      return !query || `${tier.code ?? ""} ${tier.nom} ${tier.numeroContribuable ?? ""}`.toLowerCase().includes(query);
    });
  }, [search, tiers]);

  const desactiver = async (tier: FournisseurReference) => {
    if (!window.confirm(`Désactiver le tiers « ${tier.nom} » ? Il ne pourra plus être sélectionné dans les nouveaux engagements.`)) return;
    try {
      const updated = await desactiverTiers(tier.id);
      setTiers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Le tiers n'a pas pu être désactivé."));
    }
  };

  const actifsVisibles = visibleTiers.filter((tier) => tier.actif !== false).length;
  const inactifsVisibles = visibleTiers.length - actifsVisibles;

  const ajouter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const created = await createTiers({ code: form.code, raisonSociale: form.nom, numeroContribuable: form.niu, compteBancaire: form.rib });
      setTiers((current) => [...current, created]);
      setForm({ code: "", nom: "", niu: "", rib: "" });
      setOpen(false);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Le tiers n'a pas pu être enregistré."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Référentiel des tiers</h1>
          <p className="text-sm text-slate-600">Prestataires, fournisseurs et partenaires de la collectivité.</p>
        </div>
        {hasPermission("parametrage:creer") && <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau tiers
        </Button>}
      </div>
      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Total tiers</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{visibleTiers.length}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
           <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Actifs</CardTitle></CardHeader>
           <CardContent><div className="text-3xl font-semibold text-emerald-700">{actifsVisibles}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
           <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Inactifs</CardTitle></CardHeader>
           <CardContent><div className="text-3xl font-semibold text-amber-700">{inactifsVisibles}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-600" /> Entreprises &amp; prestataires
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher..."
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Raison sociale</TableHead>
                <TableHead>N° contribuable</TableHead>
                <TableHead>RIB bancaire</TableHead>
                <TableHead>Vérification</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-mono">{tier.code ?? "-"}</TableCell>
                  <TableCell className="font-medium">{tier.nom}</TableCell>
                    <TableCell className="font-mono">{tier.numeroContribuable ?? "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{tier.compteBancaire ?? "-"}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1"><ShieldCheck className="h-3 w-3" /> Conforme</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge variant={tier.actif === false ? "secondary" : "outline"}>{tier.actif === false ? "Inactif" : "Actif"}</Badge>
                      {tier.actif !== false && hasPermission("parametrage:modifier") && <Button size="sm" variant="outline" className="gap-1" onClick={() => void desactiver(tier)}><Ban className="h-3.5 w-3.5" />Désactiver</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visibleTiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Aucun tiers trouvé pour cette collectivité.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={ajouter} className="w-full max-w-lg space-y-4 rounded-xl bg-background p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Nouveau tiers</h2>
            <Input required placeholder="Code du tiers" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            <Input required placeholder="Raison sociale" value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} />
            <Input required placeholder="N° contribuable (NIU)" value={form.niu} onChange={(event) => setForm({ ...form, niu: event.target.value })} />
            <Input required placeholder="RIB bancaire" value={form.rib} onChange={(event) => setForm({ ...form, rib: event.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
