package com.amit.smartreconciliation.controller;

import com.amit.smartreconciliation.dto.response.ApiResponse;
import com.amit.smartreconciliation.dto.response.DashboardMetricsResponse;
import com.amit.smartreconciliation.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getMetrics() {
        DashboardMetricsResponse response = dashboardService.getMetrics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
