import { useMemo, useState, type FormEvent } from "react";
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
import { Building, Plus, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/tenant/TenantContext";

const seedTiers = [
  { id: "tier-1", nom: "SOCIETE KEMOGNE & CO SARL", niu: "M082100012345P", rib: "10005 00012 98765432101 45", collectivityId: "ctd-yaounde" },
  { id: "tier-2", nom: "BTP CAMEROUN SA", niu: "M082100045678K", rib: "10005 00012 65498732101 78", collectivityId: "ctd-yaounde" },
  { id: "tier-3", nom: "FONCIER MARCHÉ URBAIN", niu: "M082100087654L", rib: "10005 00012 32198745601 12", collectivityId: "ctd-douala" },
];

export default function TiersPage() {
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tiers, setTiers] = useState(seedTiers);
  const [form, setForm] = useState({ nom: "", niu: "", rib: "" });

  const visibleTiers = useMemo(() => {
    return tiers.filter((tier) => {
      const matchesCollectivite = currentTenant ? tier.collectivityId === currentTenant.id : true;
      const query = search.toLowerCase();
      const matchesSearch = !query || `${tier.nom} ${tier.niu}`.toLowerCase().includes(query);
      return matchesCollectivite && matchesSearch;
    });
  }, [currentTenant, search, tiers]);

  const ajouter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentTenant) return;
    setTiers((current) => [
      ...current,
      {
        id: `tier-${Date.now()}`,
        nom: form.nom,
        niu: form.niu,
        rib: form.rib,
        collectivityId: currentTenant.id,
      },
    ]);
    setForm({ nom: "", niu: "", rib: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Référentiel des tiers</h1>
          <p className="text-sm text-slate-600">Prestataires, fournisseurs et partenaires de la collectivité.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau tiers
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Total tiers</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{visibleTiers.length}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Conformes</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-emerald-700">{visibleTiers.length}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">À contrôler</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-amber-700">0</div></CardContent>
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
                  <TableCell className="font-medium">{tier.nom}</TableCell>
                  <TableCell className="font-mono">{tier.niu}</TableCell>
                  <TableCell className="font-mono text-xs">{tier.rib}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1"><ShieldCheck className="h-3 w-3" /> Conforme</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">Actif</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {visibleTiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">Aucun tiers trouvé pour cette collectivité.</TableCell>
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
