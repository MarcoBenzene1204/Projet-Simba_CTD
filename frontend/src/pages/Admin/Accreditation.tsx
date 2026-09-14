import { useEffect, useMemo, useState } from "react";
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

export default function Accreditation() {
  const { role } = useAuth();
  const { currentTenant } = useTenant();
  const [users, setUsers] = useState<Utilisateur[]>([]);

  useEffect(() => {
    void listUtilisateurs()
      .then((items) => {
        const scoped = role === "SUPER_ADMINISTRATEUR" ? items : items.filter((user) => user.collectiviteId === currentTenant?.id);
        setUsers(scoped);
      })
      .catch(() => setUsers([]));
  }, [currentTenant?.id, role]);

  const entries = useMemo(
    () => (users.length > 0 ? users : [{
      id: "no-data",
      identifiantKeycloak: "no-data",
      nomUtilisateur: "Aucune donnée",
      email: "-",
      role: "CONTROLEUR_FINANCIER",
      statut: "ACTIF",
      collectiviteNom: currentTenant?.name ?? "Votre collectivité",
    } as Utilisateur]),
    [currentTenant?.name, users],
  );

  const validCount = entries.filter((user) => user.statut === "ACTIF").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fiches & cartes d&apos;accréditation</h1>
          <p className="text-sm text-slate-600">Suivi des dossiers d’identification et de validation des agents de la collectivité.</p>
        </div>
        <Badge variant="outline">{entries.length} dossiers</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Dossiers</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{entries.length}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Validés</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-emerald-700">{validCount}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">En attente</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-amber-700">{Math.max(entries.length - validCount, 0)}</div></CardContent>
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
              {entries.map((user) => (
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
                      <Button size="sm" variant="outline" className="gap-1"><Eye className="h-4 w-4" /> Voir</Button>
                      <Button size="sm" variant="outline" className="gap-1"><Download className="h-4 w-4" /> PDF</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
