import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/auth/AuthContext";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

export function Connexion() {
  const { authError, login, logout } = useAuth();

  return (
    <div className="flex min-h-full items-center justify-center shadow-lg px-6 py-8">
      <Card className="w-full max-w-md border-0 bg-white/90 shadow-xl shadow-emerald-950/10 backdrop-blur">
        <CardHeader className="space-y-4 px-8 pt-8 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900 text-white"><ShieldCheck className="h-6 w-6" /></div>
          <CardTitle className="text-3xl font-semibold tracking-tight">Votre espace sécurisé</CardTitle>

          <CardDescription>
            Connectez-vous à SIMBA CTD pour gérer l'exécution des dépenses de votre collectivité.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-8">
          {authError && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {authError}
            </p>
          )}

          {/* Connexion avec Keycloak. */}
          <Button
            type="button"
            onClick={login}
            className="h-11 w-full justify-between bg-emerald-900 px-4 text-white hover:bg-emerald-800"
          >
            <span>Continuer avec Keycloak</span><ArrowRight className="h-4 w-4" />
          </Button>

          {/* Déconnexion temporaire pour les tests. */}
          <Button type="button" variant="ghost" onClick={logout} className="w-full text-muted-foreground">Se déconnecter</Button>

          <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5" /> Accès réservé aux utilisateurs autorisés.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}