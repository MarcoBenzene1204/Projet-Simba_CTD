import { Card } from "@/components/ui/card";
import { Shell } from "lucide-react";
import { Outlet } from "react-router";

export function LoginLayout() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff6e9,_transparent_42%),linear-gradient(135deg,_#f8fbf9,_#eef4f0)] flex items-center justify-center px-4 py-8">
      {/* Un seul conteneur en grille à deux colonnes sur écran moyen ou grand. */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Colonne gauche : présentation de la plateforme. */}
        <section className="hidden md:flex flex-col justify-center px-8">
          
          <div className="justify-start items-center flex mb-8.5 border-b-2 border-emerald-800 pb-4 gap-2 rounded-l-xl">
            <Shell className="mr-2 h-10 w-10 border-2 border-emerald-800 rounded-xl  text-emerald-800 p-0.5" />
            <p className="text-5xl font-bold uppercase rounded-xl tracking-[0.1em] text-emerald-800">
              SIMBA_CTD
            </p>
          </div>

          <h1 className="text-4xl font-medium tracking-tight text-emerald-950">Piloter, engager, justifier.</h1>

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
