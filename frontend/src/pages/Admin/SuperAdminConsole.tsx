import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Boxes,
  Check,
  Globe2,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { listCollectivites, type Collectivite } from "@/api/collectivites.api";
import {
  listUtilisateurs,
  updateUtilisateur,
  type RoleApplication,
  type Utilisateur,
} from "@/api/utilisateurs.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router";

const roles: RoleApplication[] = [
  "ADMINISTRATEUR",
  "CONTROLEUR_FINANCIER",
  "ORDONNATEUR",
  "REGISSEUR",
  "COSIGNATAIRE",
  "CHEF_SERVICE",
  "RECEVEUR",
];
const modules = ["Budget et engagements", "Paiements", "Référentiels", "Journalisation", "Accréditations"];

type Section = "overview" | "users" | "modules" | "security" | "logs";

export default function SuperAdminConsole() {
  const pathname = useLocation().pathname;
  const section = pathname.split("/").pop() ?? "overview";
  const currentSection: Section =
    section === "utilisateurs" ? "users" :
    section === "configuration" ? "modules" :
    section === "journalisation-systeme" ? "logs" :
    "overview";

  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [ctds, setCtds] = useState<Collectivite[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Section>(currentSection);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("simba-modules");
    return saved ? JSON.parse(saved) : Object.fromEntries(modules.map((item) => [item, true]));
  });

  useEffect(() => {
    void Promise.all([listUtilisateurs(), listCollectivites()])
      .then(([loadedUsers, loadedCtds]) => {
        setUsers(loadedUsers);
        setCtds(loadedCtds);
      })
      .catch(() => setMessage("Les données ne sont pas disponibles pour le moment."));
  }, []);

  useEffect(() => {
    setActiveTab(currentSection);
  }, [currentSection]);

  const changeUser = async (user: Utilisateur, changes: Record<string, string>) => {
    try {
      const updated = await updateUtilisateur(user.id, changes);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage("Utilisateur mis à jour avec succès.");
    } catch {
      setMessage("La modification de cet utilisateur a échoué.");
    }
  };

  const metrics = useMemo(() => {
    const active = users.filter((user) => user.statut === "ACTIF").length;
    const suspended = users.filter((user) => user.statut === "SUSPENDU").length;
    return {
      totalUsers: users.length,
      activeUsers: active,
      suspendedUsers: suspended,
      totalCtds: ctds.length,
      activeModules: Object.values(enabledModules).filter(Boolean).length,
    };
  }, [ctds.length, enabledModules, users]);

  const filteredUsers = users.filter((user) =>
    `${user.nomUtilisateur ?? ""} ${user.email ?? ""} ${user.collectiviteNom ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const overviewCards = [
    { title: "Utilisateurs", value: metrics.totalUsers, detail: "Comptes total", icon: Users },
    { title: "Actifs", value: metrics.activeUsers, detail: "Accès validés", icon: ShieldCheck },
    { title: "Suspendus", value: metrics.suspendedUsers, detail: "Bloqués", icon: LockKeyhole },
    { title: "CTD", value: metrics.totalCtds, detail: "Collectivités gérées", icon: Globe2 },
  ];

  const logEntries = [
    { id: 1, message: "Synchronisation globale des rôles Keycloak", time: "Aujourd’hui · 08:25", status: "Succès" },
    { id: 2, message: "Alerte sur la collectivité Yaoundé : 3 dossiers en attente", time: "Aujourd’hui · 09:45", status: "Attention" },
    { id: 3, message: "Paramètres de sécurité appliqués à toutes les CTD", time: "Aujourd’hui · 11:12", status: "Succès" },
    { id: 4, message: "Mise à jour du référentiel tiers terminée", time: "Aujourd’hui · 13:40", status: "Succès" },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        icon={<Boxes />}
        title="Console d’administration globale"
        description="Gestion centralisée des comptes, des collectivités, des modules et des événements système."
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: "overview", label: "Vue d’ensemble" },
          { key: "users", label: "Utilisateurs" },
          { key: "modules", label: "Modules" },
          { key: "security", label: "Sécurité" },
          { key: "logs", label: "Journaux" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key as Section)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ title, value, detail, icon: Icon }) => (
              <Card key={title} className="border-0 shadow-sm bg-slate-50/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-emerald-700" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-semibold text-slate-900">{value}</div>
                  <p className="text-xs text-slate-600">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-600" /> Surveillances prioritaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "3 CTD avec dossiers de validation en retard",
                  "2 modules de configuration à réviser pour les prochaines déploiements",
                  "1 anomalie de sécurité sur un accès privilégié à corriger",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
                    <Shield className="mt-0.5 h-4 w-4 text-amber-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-sky-600" /> Événements récents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{entry.message}</p>
                      <p className="text-xs text-slate-500">{entry.time}</p>
                    </div>
                    <Badge variant={entry.status === "Attention" ? "destructive" : "secondary"}>{entry.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Input
                placeholder="Rechercher un utilisateur ou une collectivité..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Badge variant="outline" className="w-fit px-3 py-2">{filteredUsers.length} comptes</Badge>
          </div>

          <Card>
            <CardContent className="divide-y p-0">
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid gap-4 p-4 lg:grid-cols-[1.2fr_auto_auto] lg:items-center">
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.prenom || user.nom ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : user.nomUtilisateur ?? user.identifiantKeycloak}
                    </p>
                    <p className="text-sm text-slate-500">
                      {user.email ?? "Aucun email"} · {user.collectiviteNom ?? "Administration centrale"}
                    </p>
                  </div>

                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={user.role}
                    onChange={(event) => void changeUser(user, { role: event.target.value })}
                  >
                    {roles.filter((role) => role !== user.role).concat(user.role).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>

                  <Button
                    variant={user.statut === "SUSPENDU" ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => void changeUser(user, { statut: user.statut === "SUSPENDU" ? "ACTIF" : "SUSPENDU" })}
                  >
                    {user.statut === "SUSPENDU" ? "Réactiver" : "Suspendre"}
                  </Button>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">Aucun utilisateur trouvé.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "modules" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-emerald-600" /> Configuration des modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {modules.map((module) => (
                <label key={module} className="flex items-center justify-between rounded-xl border p-4">
                  <span className="text-sm font-medium text-slate-700">{module}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-700"
                    checked={enabledModules[module]}
                    onChange={(event) => setEnabledModules((current) => ({ ...current, [module]: event.target.checked }))}
                  />
                </label>
              ))}
              <Button
                className="mt-4"
                onClick={() => {
                  localStorage.setItem("simba-modules", JSON.stringify(enabledModules));
                  setMessage("Configuration des modules enregistrée.");
                }}
              >
                Enregistrer la configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-violet-600" /> Sécurité et conformité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Durée de session (minutes)</Label>
                <Input type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label>Tentatives avant verrouillage</Label>
                <Input type="number" defaultValue={5} />
              </div>
              <Button variant="outline" onClick={() => setMessage("Paramètres de sécurité enregistrés.")}>
                Mettre à jour la sécurité
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-amber-600" /> Sécurité globale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border bg-emerald-50 p-4 text-emerald-900">
              98,3% des accès sont conformes aux règles de sécurité définies.
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MFA</p>
                <p className="mt-2 text-2xl font-semibold">96%</p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connexions suspectes</p>
                <p className="mt-2 text-2xl font-semibold">4</p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bloquages</p>
                <p className="mt-2 text-2xl font-semibold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-sky-600" /> Journal système</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {logEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{entry.message}</p>
                  <p className="text-xs text-slate-500">{entry.time}</p>
                </div>
                <Badge variant={entry.status === "Attention" ? "destructive" : "secondary"}>{entry.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {message && <Notice>{message}</Notice>}
      <p className="text-xs text-slate-500">{ctds.length} collectivités reconnues sur la plateforme.</p>
    </div>
  );
}

function PageIntro({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function Notice({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <Check className="h-4 w-4" />
      {children}
    </div>
  );
}
