import type { LucideIcon } from 'lucide-react';

export interface NavSubItem {
  titre: string;
  icon: LucideIcon;
  url: string;
  permission?: string;
  comingSoon?: boolean;
  iconClass?: string;
}

export interface NavGroup {
  label: string;
  items: NavSubItem[];
}


export interface users {
  name: string;
  email: string;
  role: string;
}
