import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Upload } from "lucide-react";
import { data } from "@/lib/CurrentUser";

export default function AgentDashboard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight uppercase">
        Bonjour cher {data.role}
      </h1>
      <h1 className="text-2xl font-bold tracking-tight">
        Saisie d'Attestation de Service Fait
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" /> Procès-Verbal de
            Réception Terrain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                N° D'engagement Concerné
              </label>
              <Input placeholder="Ex: ENG-2026-0089" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro du PV</label>
              <Input placeholder="Ex: PV-REC-2026-012" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Scanner / Importer le PV signé
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cliquez ou glissez-déposez le document scanné (PDF)
              </span>
            </div>
          </div>

          <Button className="w-full">Enregistrer et Transmettre</Button>
        </CardContent>
      </Card>
    </div>
  );
}
