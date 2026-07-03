package com.expensetracker.service.interfaces;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {
    List<ExpenseResponse> getAllExpenses();
    ExpenseResponse getExpenseById(Long id);
    ExpenseResponse createExpense(ExpenseRequest request);
    ExpenseResponse updateExpense(Long id, ExpenseRequest request);
    void deleteExpense(Long id);
    List<ExpenseResponse> filterExpenses(Long categoryId, LocalDate startDate, LocalDate endDate, Double minAmount, Double maxAmount);
}
