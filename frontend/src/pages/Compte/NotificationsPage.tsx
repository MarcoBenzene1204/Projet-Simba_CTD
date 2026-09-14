import { Bell, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Centre de suivi</p>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Retrouvez ici les alertes et événements liés à vos workflows.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Centre de notifications</CardTitle></CardHeader>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="font-medium">Aucune notification à afficher</p>
          <p className="max-w-md text-sm text-muted-foreground">Le backend de notifications n'est pas encore connecté à cette interface. Vos alertes apparaîtront ici lorsqu'il sera disponible.</p>
        </CardContent>
      </Card>
    </div>
  );
}
