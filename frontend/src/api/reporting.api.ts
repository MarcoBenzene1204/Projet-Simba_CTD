import api from "./axios";

export interface ReportingSummary {
  totalEngagements: number;
  totalLiquidations: number;
  totalMandats: number;
  totalPaiements: number;
  montantEngages: number;
  montantLiquidations: number;
  montantMandats: number;
  montantPaiements: number;
  engagementsSoumis: number;
  liquidationsValidees: number;
  mandatsTransmis: number;
  paiementsExecutes: number;
}

export interface ReportingDashboardKpi {
  title: string;
  value: number | string;
  detail: string;
}

export interface ReportingDashboardChartPoint {
  label: string;
  value: number;
}

export interface ReportingDashboardChart {
  title: string;
  type: string;
  data: ReportingDashboardChartPoint[];
}

export interface ReportingDashboard {
  role: string;
  globalView: boolean;
  kpis: ReportingDashboardKpi[];
  charts: ReportingDashboardChart[];
  insights: string[];
  note: string;
}

export const reportingApi = {
  getSummary: async (): Promise<ReportingSummary> => {
    const response = await api.get<ReportingSummary>("/reporting/summary");
    return response.data;
  },

  getDashboard: async (): Promise<ReportingDashboard> => {
    const response = await api.get<ReportingDashboard>("/reporting/dashboard");
    return response.data;
  },
};
