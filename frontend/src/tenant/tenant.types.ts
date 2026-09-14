export interface Tenant {
  id: string;
  code: string;
  name: string;
  type: string;
  region?: string;
  department?: string;
  logo?: string;
  primaryColor?: string;
  accentColor?: string;
  active: boolean;
}
