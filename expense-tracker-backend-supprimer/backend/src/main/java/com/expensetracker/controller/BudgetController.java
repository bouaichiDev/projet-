package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.dto.response.BudgetStatusResponse;
import com.expensetracker.service.interfaces.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/budget")
@Tag(name = "Budget Management", description = "Endpoints for defining and monitoring monthly budgets")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Consult monthly budget status with automatic usage calculations and warnings")
    public ResponseEntity<ApiResponse<BudgetStatusResponse>> getBudgetStatus(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        BudgetStatusResponse response = budgetService.getBudgetStatus(month, year);
        return ResponseEntity.ok(
                ApiResponse.success("Monthly budget status retrieved successfully", response)
        );
    }

    @PostMapping
    @Operation(summary = "Define a monthly budget limit")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.createOrUpdateBudget(request);
        return ResponseEntity.ok(
                ApiResponse.success("Budget created successfully", response)
        );
    }

    @PutMapping
    @Operation(summary = "Modify a monthly budget limit")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.createOrUpdateBudget(request);
        return ResponseEntity.ok(
                ApiResponse.success("Budget updated successfully", response)
        );
    }
}
