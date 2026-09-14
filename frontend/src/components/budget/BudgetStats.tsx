import { CheckCircle2, FileText, Wallet } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { StatCard } from "./StatCard";

interface BudgetStatsProps {
  creditVote: string;
  consommation: number;
  disponibilite: string;
}

export function BudgetStats({
  creditVote,
  consommation,
  disponibilite,
}: BudgetStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Crédit voté"
        value={creditVote}
        description="Exercice 2026"
        icon={Wallet}
      />

      <StatCard
        title="Consommation budgétaire"
        value={`${consommation}%`}
        icon={FileText}
      />

      <StatCard
        title="Disponibilité"
        value={disponibilite}
        description="Crédits disponibles"
        icon={CheckCircle2}
      />

      <div className="md:col-span-3">
        <Progress value={consommation} />
      </div>
    </div>
  );
}
