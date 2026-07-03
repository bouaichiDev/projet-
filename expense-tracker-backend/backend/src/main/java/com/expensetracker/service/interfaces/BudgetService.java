package com.expensetracker.service.interfaces;

import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.dto.response.BudgetStatusResponse;

public interface BudgetService {
    BudgetResponse createOrUpdateBudget(BudgetRequest request);
    BudgetStatusResponse getBudgetStatus(Integer month, Integer year);
}
