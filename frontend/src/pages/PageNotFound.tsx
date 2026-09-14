import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm tracking-widest text-muted-foreground">
        ERREUR 404
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Page introuvable
      </h1>
      <p className="max-w-md font-serif text-muted-foreground">
        La page demandée n'existe pas ou a été déplacée.
      </p>
      <Button size="lg" render={<Link to="/dashboard" />} className="mt-2">
        Retour à l'accueil
      </Button>
    </div>
  );
}
