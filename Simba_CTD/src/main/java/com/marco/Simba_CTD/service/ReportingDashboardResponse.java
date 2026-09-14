package com.marco.Simba_CTD.service;

import java.math.BigDecimal;
import java.util.List;

public record ReportingDashboardResponse(
        String role,
        boolean globalView,
        List<ReportingKpi> kpis,
        List<ReportingSeries> charts,
        List<String> insights,
        String note
) {

    public record ReportingKpi(
            String title,
            String value,
            String trend,
            String detail
    ) {}

    public record ReportingSeries(
            String title,
            String type,
            List<ReportingPoint> points
    ) {}

    public record ReportingPoint(
            String label,
            Number value,
            String color
    ) {}

    public record SummaryMetric(
            String label,
            BigDecimal value
    ) {}
}
