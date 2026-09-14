import { useMemo } from "react";
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
import { AlertTriangle, Logs } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";

const allLogs = [
  {
    id: "LOG-101",
    timestamp: "2026-09-09 08:12:12",
    user: "A. Mballa",
    action: "Validation de mandat MND-2026-0042",
    module: "MANDAT",
    level: "INFO",
    collectivityId: "ctd-yaounde",
    collectivity: "Mairie de Yaoundé",
    issue: "Aucun",
  },
  {
    id: "LOG-102",
    timestamp: "2026-09-09 09:30:48",
    user: "S. Ndongo",
    action: "Création d’un utilisateur de service",
    module: "UTILISATEURS",
    level: "INFO",
    collectivityId: "ctd-yaounde",
    collectivity: "Mairie de Yaoundé",
    issue: "Aucun",
  },
  {
    id: "LOG-103",
    timestamp: "2026-09-09 10:06:31",
    user: "System / Keycloak",
    action: "Échec d’authentification avec mot de passe invalide",
    module: "AUTH",
    level: "WARN",
    collectivityId: "ctd-douala",
    collectivity: "Mairie de Douala",
    issue: "Tentative de connexion refusée",
  },
  {
    id: "LOG-104",
    timestamp: "2026-09-09 11:18:23",
    user: "M. Tchoua",
    action: "Relance d’un engagement en attente",
    module: "ENGAGEMENT",
    level: "INFO",
    collectivityId: "ctd-douala",
    collectivity: "Mairie de Douala",
    issue: "Dossier relancé",
  },
  {
    id: "LOG-105",
    timestamp: "2026-09-09 12:42:50",
    user: "E. Kome",
    action: "Modification de la grille budgétaire",
    module: "BUDGET",
    level: "WARN",
    collectivityId: "ctd-bafoussam",
    collectivity: "Mairie de Bafoussam",
    issue: "Budget incomplet sur une ligne",
  },
  {
    id: "LOG-106",
    timestamp: "2026-09-09 14:05:11",
    user: "Super-admin",
    action: "Synchro globale des collectivités et des permissions",
    module: "ADMINISTRATION",
    level: "INFO",
    collectivityId: "global",
    collectivity: "Plateforme globale",
    issue: "Aucun",
  },
];

export default function LogsPage() {
  const { role } = useAuth();
  const { currentTenant } = useTenant();
  const isSuperAdmin = role === "SUPER_ADMINISTRATEUR";

  const logs = useMemo(() => {
    if (isSuperAdmin) return allLogs;
    return allLogs.filter((log) => log.collectivityId === currentTenant?.id || log.collectivityId === "global");
  }, [currentTenant?.id, isSuperAdmin]);

  const stats = useMemo(
    () => ({
      info: logs.filter((log) => log.level === "INFO").length,
      warn: logs.filter((log) => log.level === "WARN").length,
      total: logs.length,
    }),
    [logs],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journaux & logs système</h1>
        <p className="text-sm text-slate-600">Traçabilité, audit et supervision des événements par collectivité ou globalement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Total</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Infos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-emerald-700">{stats.info}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Alertes</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-amber-700">{stats.warn}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Logs className="h-5 w-5 text-emerald-600" /> Pistes d&apos;audit & traçabilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Collectivité</TableHead>
                <TableHead className="text-right">Niveau</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span>{log.action}</span>
                      <span className="block text-xs text-slate-500">{log.issue}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{log.module}</Badge></TableCell>
                  <TableCell>{log.collectivity}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.level === "WARN" ? "destructive" : "secondary"} className={log.level === "INFO" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                      {log.level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Aucun log disponible pour votre collectivité.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Surveillance</div>
        <p className="mt-2">Les éléments de niveau WARN sont à contrôler prioritairement pour éviter les impacts sur les opérations de paiement et de validation.</p>
      </div>
    </div>
  );
}
