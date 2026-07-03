package com.expensetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusResponse {
    private Double budgetAmount;
    private Double totalExpenses;
    private Double remainingAmount;
    private Double percentageConsumed;
    private boolean warning;
    private String message;
}
