package com.expensetracker.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Budget amount must be positive")
    private Double amount;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be at least 1 (January)")
    @Max(value = 12, message = "Month must be at most 12 (December)")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be 2000 or later")
    private Integer year;
}
