import type { ReactNode } from "react";
import { Link } from "react-router";

interface DashboardLinkProps {
  to: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export function DashboardLink({ to, label, children, className = "" }: DashboardLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`block rounded-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {children}
    </Link>
  );
}
