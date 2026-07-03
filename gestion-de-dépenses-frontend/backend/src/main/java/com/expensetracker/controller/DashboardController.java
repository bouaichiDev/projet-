package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.response.DashboardStatsResponse;
import com.expensetracker.service.interfaces.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard Statistics", description = "Endpoints for retrieving aggregated insights and trends")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get high-level dashboard data (totals, category shares, budget status)")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        DashboardStatsResponse stats = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard data retrieved successfully", stats)
        );
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get detailed trends, top spending categories, and monthly evolution")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStatistics() {
        DashboardStatsResponse stats = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard statistics retrieved successfully", stats)
        );
    }
}
