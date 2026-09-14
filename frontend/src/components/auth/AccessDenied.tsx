import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccessDenied() {
  return <div className="flex min-h-[50vh] items-center justify-center"><Card className="max-w-md"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />Accès refusé</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-muted-foreground"><p>Votre profil ne possède pas la permission nécessaire pour consulter cette page.</p><Button render={<Link to="/dashboard" />}>Retour au tableau de bord</Button></CardContent></Card></div>;
}