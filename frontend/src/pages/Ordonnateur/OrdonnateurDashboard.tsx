import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/budget/PageHeader";
import { BudgetStats } from "@/components/budget/BudgetStats";
import { useAuthorization } from "@/auth/useAuthorization";
import { useNavigate } from "react-router";
import { useTenant } from "@/tenant/TenantContext";

export default function OrdonnateurDashboard() {
  const { currentTenant } = useTenant();
   const { hasPermission } = useAuthorization();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Exécution budgétaire"
        description={
          currentTenant
            ? `Execution budgétaire - ${currentTenant.name}`
            : "Execution budgétaire"
        }
        action={
          hasPermission("engagement:creer") && (
            <Button className="gap-2" onClick={() => navigate("/dashboard/gestion-ordonnateur/engagement/nouveau")}>
              <Plus className="h-4 w-4" /> Créer un Engagement
            </Button>
          )
        }
      />

      <BudgetStats
        creditVote="500 000 000 FCFA"
        consommation={62}
        disponibilite="190 000 000 FCFA"
      />
    </div>
  );
}
