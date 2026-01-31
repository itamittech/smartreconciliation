package com.amit.smartreconciliation.service.tool;

import com.amit.smartreconciliation.dto.response.DashboardMetricsResponse;
import com.amit.smartreconciliation.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * 🛠️ DASHBOARD TOOLS (Agentic AI)
 *
 * Provides AI chat with the ability to retrieve system-wide metrics and KPIs.
 */
@Component
public class DashboardTools {

    private static final Logger log = LoggerFactory.getLogger(DashboardTools.class);

    private final DashboardService dashboardService;

    public DashboardTools(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Tool(description = "Retrieves comprehensive dashboard metrics including total reconciliations, completion rates, match rates, exception statistics, and recent activity. Use this when the user asks about overall system performance, statistics, KPIs, or wants a general overview of the reconciliation platform.")
    public DashboardMetricsResponse getDashboardMetrics() {

        log.info("🤖 Tool Call: getDashboardMetrics()");

        return dashboardService.getMetrics();
    }
}
