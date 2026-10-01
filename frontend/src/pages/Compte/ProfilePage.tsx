import { Check, Mail, MapPin, Moon, Phone, ShieldCheck, Sun, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { useTenant } from "@/tenant/TenantContext";
import { useTheme } from "@/theme/ThemeProvider";

export default function ProfilePage() {
  const { currentTenant } = useTenant();
  const { username, email, firstName, lastName, telephone, matricule, role, statut } = useAuth();
  const { mode, setMode } = useTheme();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || username || "Utilisateur SIMBA";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Compte utilisateur</p>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Consultez les informations métier de votre compte.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" />Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Nom complet" value={displayName} />
            <ProfileField label="Nom d'utilisateur" value={username} />
            <ProfileField label="Adresse e-mail" value={email} icon={<Mail className="h-4 w-4" />} />
            <ProfileField label="Téléphone" value={telephone} icon={<Phone className="h-4 w-4" />} />
            <ProfileField label="Matricule" value={matricule} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Accès métier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-muted-foreground">Rôle</p><Badge className="mt-1 bg-primary text-primary-foreground">{role ?? "Non défini"}</Badge></div>
            <div><p className="text-xs text-muted-foreground">Statut</p><Badge variant="outline" className="mt-1">{statut ?? "Non défini"}</Badge></div>
            <div className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{currentTenant?.name ?? "Collectivité non renseignée"}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-primary" />Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={mode === "light"}
              onClick={() => setMode("light")}
              className="flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/60 data-[active=true]:border-primary data-[active=true]:bg-primary/10"
              data-active={mode === "light"}
            >
              <span className="flex items-center gap-3"><Sun className="h-5 w-5 text-amber-500" /><span><strong className="block text-sm">Mode jour</strong><span className="text-xs text-muted-foreground">Interface claire</span></span></span>
              {mode === "light" && <Check className="h-4 w-4 text-primary" />}
            </button>
            <button
              type="button"
              aria-pressed={mode === "dark"}
              onClick={() => setMode("dark")}
              className="flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/60 data-[active=true]:border-primary data-[active=true]:bg-primary/10"
              data-active={mode === "dark"}
            >
              <span className="flex items-center gap-3"><Moon className="h-5 w-5 text-indigo-400" /><span><strong className="block text-sm">Mode sombre</strong><span className="text-xs text-muted-foreground">Interface à faible luminosité</span></span></span>
              {mode === "dark" && <Check className="h-4 w-4 text-primary" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 flex items-center gap-2 text-sm font-medium">{icon}<span>{value || "Non renseigné"}</span></p></div>;
}
