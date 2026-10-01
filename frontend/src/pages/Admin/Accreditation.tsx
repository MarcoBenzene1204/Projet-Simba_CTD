import { useEffect, useState } from "react";
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
import { CheckCircle2, Clock3, Download, Eye, IdCard } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";
import { listUtilisateurs, type Utilisateur } from "@/api/utilisateurs.api";
import { apiErrorMessage } from "@/api/api-error";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Accreditation() {
  const { role } = useAuth();
  const { tenants, currentTenant, setCurrentTenant } = useTenant();
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [printUser, setPrintUser] = useState<Utilisateur | null>(null);

  useEffect(() => {
    if (!currentTenant?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(undefined);
    void listUtilisateurs()
      .then((items) => {
        if (active) setUsers(items.filter((user) => user.collectiviteId === currentTenant.id));
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause, "Impossible de charger les fiches d’accréditation."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentTenant?.id]);

  useEffect(() => {
    if (!printUser) return;
    window.print();
    setPrintUser(null);
  }, [printUser]);

  const validCount = users.filter((user) => user.statut === "ACTIF").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fiches & cartes d&apos;accréditation</h1>
          <p className="text-sm text-slate-600">Suivi des dossiers d’identification et de validation des agents de la collectivité.</p>
        </div>
        <Badge variant="outline">{users.length} dossiers</Badge>
      </div>

      {role === "SUPER_ADMINISTRATEUR" && (
        <label className="grid max-w-xl gap-2 text-sm font-medium">Collectivité
          <select className="h-10 rounded-md border bg-background px-3" value={currentTenant?.id ?? ""} onChange={(event) => {
            const tenant = tenants.find((item) => item.id === event.target.value);
            if (tenant) setCurrentTenant(tenant);
          }}><option value="" disabled>Sélectionner une collectivité</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</select>
        </label>
      )}
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Dossiers</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{loading ? "…" : users.length}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Validés</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-emerald-700">{loading ? "…" : validCount}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">En attente</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-amber-700">{loading ? "…" : Math.max(users.length - validCount, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-emerald-600" /> Fiches générées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent / utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Collectivité</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.nomUtilisateur || user.identifiantKeycloak || "Utilisateur"}</div>
                    <div className="text-xs text-slate-500">{user.email || "Aucun email"}</div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.collectiviteNom || currentTenant?.name || "-"}</TableCell>
                  <TableCell>
                    {user.statut === "ACTIF" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Valide</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1"><Clock3 className="h-3 w-3" /> En attente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /> Voir</Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setPrintUser(user)}><Download className="h-4 w-4" /> PDF</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && users.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune fiche d’accréditation pour cette collectivité.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {printUser && (
        <>
          <style>{`@media print { body * { visibility: hidden !important; } #accreditation-print, #accreditation-print * { visibility: visible !important; } #accreditation-print { display: block !important; position: absolute; inset: 0; padding: 20mm; color: #18251d; background: white; font: 14px Arial, sans-serif; } #accreditation-print header { border-bottom: 3px solid #14532d; padding-bottom: 16px; margin-bottom: 28px; } #accreditation-print h1 { font-size: 24px; } #accreditation-print dl { margin-top: 24px; } #accreditation-print dl div { display: grid; grid-template-columns: 32% 1fr; gap: 12px; padding: 14px; border-bottom: 1px solid #d8e4dc; } #accreditation-print dt { color: #52645a; } }`}</style>
          <section id="accreditation-print" className="hidden print:block">
            <header><h1>Fiche d’accréditation</h1><p>SIMBA CTD · {currentTenant?.name ?? "Collectivité"}</p></header>
            <h2>{printUser.nomUtilisateur || `${printUser.prenom ?? ""} ${printUser.nom ?? ""}`.trim() || printUser.identifiantKeycloak}</h2>
            <dl>
              {[["Identifiant", printUser.identifiantKeycloak], ["Nom d’utilisateur", printUser.nomUtilisateur || "-"], ["Nom complet", `${printUser.prenom ?? ""} ${printUser.nom ?? ""}`.trim() || "-"], ["Courriel", printUser.email || "-"], ["Rôle", printUser.role.replaceAll("_", " ")], ["Collectivité", currentTenant?.name || printUser.collectiviteNom || "-"], ["Statut", printUser.statut]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>
        </>
      )}
      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche d’accréditation</DialogTitle>
            <DialogDescription>{currentTenant?.name ?? "Collectivité"}</DialogDescription>
          </DialogHeader>
          {selectedUser && <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">{selectedUser.nomUtilisateur || `${selectedUser.prenom ?? ""} ${selectedUser.nom ?? ""}`.trim() || selectedUser.identifiantKeycloak}</h2>
            <dl className="divide-y rounded-md border">
              {[["Identifiant", selectedUser.identifiantKeycloak], ["Courriel", selectedUser.email || "-"], ["Rôle", selectedUser.role.replaceAll("_", " ")], ["Statut", selectedUser.statut], ["Collectivité", currentTenant?.name ?? selectedUser.collectiviteNom ?? "-"]].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3 p-3"><dt className="text-muted-foreground">{label}</dt><dd className="break-all font-medium">{value}</dd></div>)}
            </dl>
            <div className="flex justify-end"><Button className="gap-2" onClick={() => setPrintUser(selectedUser)}><Download className="h-4 w-4" />Imprimer / PDF</Button></div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
