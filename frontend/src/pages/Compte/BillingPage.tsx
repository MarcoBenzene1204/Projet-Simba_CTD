import { CreditCard, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Configuration de la plateforme</p>
        <h1 className="text-2xl font-semibold tracking-tight">Facturation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Consultez les informations de facturation de votre organisation.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Service de facturation</CardTitle></CardHeader>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <Info className="h-10 w-10 text-info" />
          <p className="font-medium">Service non disponible</p>
          <p className="max-w-md text-sm text-muted-foreground">Aucun endpoint de facturation n'est actuellement exposé par le backend SIMBA CTD. Cette interface sera activée lorsque le service sera disponible.</p>
        </CardContent>
      </Card>
    </div>
  );
}
