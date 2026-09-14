import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface RoleReportingCardProps {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function RoleReportingCard({
  title,
  value,
  detail,
  icon: Icon,
  accentClassName = "text-emerald-600",
}: RoleReportingCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${accentClassName}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}
