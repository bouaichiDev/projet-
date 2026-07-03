package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.service.interfaces.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense Management", description = "Endpoints for tracking personal expenses")
@SecurityRequirement(name = "bearerAuth")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    @Operation(summary = "Get all expenses for the current user")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses() {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(
                ApiResponse.success("Expenses retrieved successfully", expenses)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a single expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(@PathVariable Long id) {
        ExpenseResponse expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Expense details retrieved successfully", expense)
        );
    }

    @PostMapping
    @Operation(summary = "Log a new expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.createExpense(request);
        return new ResponseEntity<>(
                ApiResponse.success("Expense logged successfully", response),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing expense log")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Expense updated successfully", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense log")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(
                ApiResponse.success("Expense deleted successfully")
        );
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter expenses by multiple optional criteria (category, dates, period, amount bounds)")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> filterExpenses(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        List<ExpenseResponse> expenses = expenseService.filterExpenses(categoryId, startDate, endDate, minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success("Filtered expenses retrieved successfully", expenses)
        );
    }
}
