import { Card } from "@/components/ui/card";
import { Shell } from "lucide-react";
import { Outlet } from "react-router";

export function LoginLayout() {
  return (
    <main className="login-surface min-h-screen flex items-center justify-center px-4 py-8 text-foreground">
      {/* Un seul conteneur en grille à deux colonnes sur écran moyen ou grand. */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Colonne gauche : présentation de la plateforme. */}
        <section className="hidden md:flex flex-col justify-center px-8">
          
          <div className="justify-start items-center flex mb-8.5 border-b-2 border-primary pb-4 gap-2 rounded-l-xl">
            <Shell className="mr-2 h-10 w-10 border-2 border-primary rounded-xl text-primary p-0.5" />
            <p className="text-5xl font-bold uppercase rounded-xl tracking-[0.1em] text-primary">
              SIMBA_CTD
            </p>
          </div>

          <h1 className="text-4xl font-medium tracking-tight">Piloter, engager, justifier.</h1>

          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
            Une plateforme dédiée à la gestion, au suivi et au contrôle de
            l'exécution des dépenses des Collectivités Territoriales
            Décentralisées.
          </p>
        </section>
          {/* Colonne droite : formulaire de connexion via Outlet. */}
          <Card className="w-full max-w-md mx-auto shadow-lg border-none p-6">
            <Outlet />
          </Card>
      </div>
    </main>
  );
}
