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
import { Input } from "@/components/ui/input";
import { Plus, Search, Shield, Users, UserPlus } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollectivites } from "@/api/collectivites.api";
import {
  createAdministrateur,
  createUtilisateur,
  listAdministrateurs,
  listUtilisateurs,
  type RoleApplication,
  type Utilisateur,
} from "@/api/utilisateurs.api";
import { useTenant } from "@/tenant/TenantContext";
import { apiErrorMessage } from "@/api/api-error";

const roles: { value: RoleApplication; label: string }[] = [
  { value: "ADMINISTRATEUR", label: "Administrateur" },
  { value: "CONTROLEUR_FINANCIER", label: "Contrôleur financier" },
  { value: "ORDONNATEUR", label: "Ordonnateur" },
  { value: "REGISSEUR", label: "Régisseur" },
  { value: "COSIGNATAIRE", label: "Cosignataire" },
  { value: "CHEF_SERVICE", label: "Chef de service" },
  { value: "RECEVEUR", label: "Receveur" },
  { value: "SUPER_ADMINISTRATEUR", label: "Super-administrateur" },
];

export default function CollectiviteList() {
  const { roles: currentRoles, collectiviteId } = useAuth();
  const { currentTenant } = useTenant();
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [collectivites, setCollectivites] = useState<{ id: string; nom: string }[]>([]);
  const [collectivitesLoading, setCollectivitesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const superAdministrateur = currentRoles.includes("SUPER_ADMINISTRATEUR");
  const [form, setForm] = useState({
    identifiantKeycloak: "",
    nomUtilisateur: "",
    prenom: "",
    nom: "",
    email: "",
    role: (superAdministrateur ? "ADMINISTRATEUR" : "CONTROLEUR_FINANCIER") as RoleApplication,
    collectiviteId: currentTenant?.id ?? collectiviteId ?? "",
  });

  useEffect(() => {
    const usersRequest = superAdministrateur ? listAdministrateurs() : listUtilisateurs();
    const collectivitesRequest = superAdministrateur ? listCollectivites() : Promise.resolve([]);
    setCollectivitesLoading(superAdministrateur);

    void Promise.allSettled([usersRequest, collectivitesRequest])
      .then(([usersResult, collectivitesResult]) => {
        if (usersResult.status === "fulfilled") {
          setUsers(usersResult.value);
        } else {
          setError(apiErrorMessage(usersResult.reason, "Impossible de charger les utilisateurs."));
        }

        if (collectivitesResult.status === "fulfilled") {
          const accessibles = superAdministrateur
            ? collectivitesResult.value
            : collectivitesResult.value.filter(({ id }) => id === currentTenant?.id);
          const collectivitesExistantes = accessibles.filter(({ id, nom }) => id && nom?.trim());
          setCollectivites(collectivitesExistantes.map(({ id, nom }) => ({ id, nom: nom.trim() })));
          if (superAdministrateur) {
            setForm((current) =>
              collectivitesExistantes.some(({ id }) => id === current.collectiviteId)
                ? current
                : { ...current, collectiviteId: collectivitesExistantes[0]?.id ?? "" },
            );
          }
        } else if (superAdministrateur) {
          setCollectivites([]);
          setError(
            apiErrorMessage(
              collectivitesResult.reason,
              "Impossible de charger les collectivités. Vérifiez votre accès au serveur.",
            ),
          );
        }
      })
      .finally(() => setCollectivitesLoading(false));
  }, [collectiviteId, currentTenant?.id, superAdministrateur]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!superAdministrateur && form.role === "ADMINISTRATEUR") {
      setError("Seul le super-administrateur peut créer un administrateur.");
      return;
    }

    try {
      const created = superAdministrateur
        ? await createAdministrateur({
            identifiantKeycloak: form.identifiantKeycloak,
            nomUtilisateur: form.nomUtilisateur,
            prenom: form.prenom,
            nom: form.nom,
            email: form.email,
            collectiviteId: form.collectiviteId,
          })
        : await createUtilisateur({
            ...form,
            collectiviteId: currentTenant?.id ?? collectiviteId,
          });
      setUsers((current) => [...current, created]);
      setOpen(false);
    } catch (error) {
      setError(apiErrorMessage(error, "La création a échoué. Vérifiez l'identifiant Keycloak et les champs obligatoires."));
    }
  }

  const visibleUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.nomUtilisateur ?? ""} ${user.email ?? ""} ${user.identifiantKeycloak ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, users],
  );

  const rolesDisponibles = roles.filter((item) =>
    superAdministrateur
      ? item.value === "ADMINISTRATEUR"
      : item.value !== "ADMINISTRATEUR" && item.value !== "SUPER_ADMINISTRATEUR",
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      actifs: users.filter((user) => user.statut === "ACTIF").length,
      suspendus: users.filter((user) => user.statut === "SUSPENDU").length,
    }),
    [users],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-sm text-slate-600">Administration centralisée des comptes applicatifs et de leurs rôles.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-slate-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Total</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-slate-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Actifs</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-emerald-700">{stats.actifs}</div></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Suspendus</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-amber-700">{stats.suspendus}</div></CardContent>
        </Card>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" /> Comptes enregistrés</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Collectivité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.nomUtilisateur || `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || user.identifiantKeycloak}
                  </TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> {user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.statut === "SUSPENDU" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}>{user.statut}</Badge>
                  </TableCell>
                  <TableCell>{user.collectiviteNom || "Toutes"}</TableCell>
                </TableRow>
              ))}
              {visibleUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <div>
              <h2 className="text-xl font-semibold">Ajouter un utilisateur</h2>
              <p className="text-sm text-slate-600">Le compte doit déjà exister dans Keycloak avant d’être activé dans Simba CTD.</p>
            </div>

            <Input required placeholder="Identifiant unique Keycloak (sub / UUID)" value={form.identifiantKeycloak} onChange={(event) => setForm({ ...form, identifiantKeycloak: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nom d’utilisateur" value={form.nomUtilisateur} onChange={(event) => setForm({ ...form, nomUtilisateur: event.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <Input placeholder="Prénom" value={form.prenom} onChange={(event) => setForm({ ...form, prenom: event.target.value })} />
              <Input placeholder="Nom" value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} />
            </div>

            <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as RoleApplication })}>
              {rolesDisponibles.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>

            {superAdministrateur && form.role !== "SUPER_ADMINISTRATEUR" && (
              <select required className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={form.collectiviteId} onChange={(event) => setForm({ ...form, collectiviteId: event.target.value })}>
                <option value="" disabled>{collectivitesLoading ? "Chargement des collectivités..." : "Sélectionner une collectivité"}</option>
                {collectivites.map((collectivite) => <option key={collectivite.id} value={collectivite.id}>{collectivite.nom}</option>)}
              </select>
            )}

            {!superAdministrateur && <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600">Collectivité d’affectation : votre collectivité uniquement.</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" className="gap-2"><UserPlus className="h-4 w-4" /> Créer</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
