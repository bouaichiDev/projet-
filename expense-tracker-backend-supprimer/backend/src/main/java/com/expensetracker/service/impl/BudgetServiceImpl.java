package com.expensetracker.service.impl;

import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.dto.response.BudgetStatusResponse;
import com.expensetracker.entity.MonthlyBudget;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.BudgetMapper;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.MonthlyBudgetRepository;
import com.expensetracker.service.interfaces.BudgetService;
import com.expensetracker.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private MonthlyBudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetMapper budgetMapper;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    @Transactional
    public BudgetResponse createOrUpdateBudget(BudgetRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Optional<MonthlyBudget> existingBudget = budgetRepository.findByUserAndMonthAndYear(
                currentUser, request.getMonth(), request.getYear()
        );

        MonthlyBudget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setAmount(request.getAmount());
        } else {
            budget = budgetMapper.toEntity(request);
            budget.setUser(currentUser);
        }

        MonthlyBudget savedBudget = budgetRepository.save(budget);
        return budgetMapper.toResponse(savedBudget);
    }

    @Override
    public BudgetStatusResponse getBudgetStatus(Integer month, Integer year) {
        User currentUser = securityUtils.getCurrentUser();

        // Default to current date if parameters are missing
        if (month == null || year == null) {
            LocalDate today = LocalDate.now();
            if (month == null) month = today.getMonthValue();
            if (year == null) year = today.getYear();
        }

        Optional<MonthlyBudget> budgetOpt = budgetRepository.findByUserAndMonthAndYear(currentUser, month, year);
        Double budgetAmount = budgetOpt.map(MonthlyBudget::getAmount).orElse(0.0);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        Double totalExpenses = expenseRepository.calculateTotalExpensesInPeriod(currentUser, startDate, endDate);
        if (totalExpenses == null) {
            totalExpenses = 0.0;
        }

        Double remainingAmount = budgetAmount - totalExpenses;
        Double percentageConsumed = 0.0;
        if (budgetAmount > 0) {
            percentageConsumed = (totalExpenses / budgetAmount) * 100;
        }

        boolean warning = false;
        String message = "Budget respecté";

        if (budgetAmount > 0 && totalExpenses > budgetAmount) {
            warning = true;
            message = "Budget dépassé";
        } else if (budgetAmount == 0.0 && totalExpenses > 0.0) {
            warning = true;
            message = "Aucun budget défini pour ce mois et des dépenses ont été effectuées !";
        }

        return BudgetStatusResponse.builder()
                .budgetAmount(budgetAmount)
                .totalExpenses(totalExpenses)
                .remainingAmount(remainingAmount)
                .percentageConsumed(percentageConsumed)
                .warning(warning)
                .message(message)
                .build();
    }
}
