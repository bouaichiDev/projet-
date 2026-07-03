package com.expensetracker.service.impl;

import com.expensetracker.dto.response.DashboardStatsResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.interfaces.DashboardService;
import com.expensetracker.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    public DashboardStatsResponse getDashboardStatistics() {
        User currentUser = securityUtils.getCurrentUser();
        List<Expense> allExpenses = expenseRepository.findByUserOrderByExpenseDateDesc(currentUser);

        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        // 1. General Metrics
        Double totalExpenses = allExpenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        Long totalExpenseCount = (long) allExpenses.size();

        Double currentMonthExpenses = allExpenses.stream()
                .filter(e -> e.getExpenseDate().getMonthValue() == currentMonth &&
                        e.getExpenseDate().getYear() == currentYear)
                .mapToDouble(Expense::getAmount)
                .sum();

        // 2. Expenses By Category
        Map<Category, Double> categoryAmounts = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        Map<String, Double> expensesByCategory = new HashMap<>();
        categoryAmounts.forEach((cat, amt) -> expensesByCategory.put(cat.getName(), amt));

        // 3. Top Categories (sorted by total amount descending)
        List<DashboardStatsResponse.CategorySumDto> topCategories = categoryAmounts.entrySet().stream()
                .map(entry -> {
                    Category cat = entry.getKey();
                    Double amt = entry.getValue();
                    double pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0.0;
                    return DashboardStatsResponse.CategorySumDto.builder()
                            .categoryName(cat.getName())
                            .color(cat.getColor())
                            .icon(cat.getIcon())
                            .totalAmount(amt)
                            .percentage(pct)
                            .build();
                })
                .sorted(Comparator.comparing(DashboardStatsResponse.CategorySumDto::getTotalAmount).reversed())
                .limit(5) // Top 5
                .collect(Collectors.toList());

        // 4. Monthly Evolution (trend of last 6 months)
        // Let's group by "yyyy-MM" format
        DateTimeFormatter trendFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Double> monthlyRaw = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getExpenseDate().format(trendFormatter),
                        Collectors.summingDouble(Expense::getAmount)
                ));

        // Sort by key chronologically (ascending)
        Map<String, Double> monthlyEvolution = new TreeMap<>(monthlyRaw);

        return DashboardStatsResponse.builder()
                .totalExpenses(totalExpenses)
                .currentMonthExpenses(currentMonthExpenses)
                .totalExpenseCount(totalExpenseCount)
                .expensesByCategory(expensesByCategory)
                .topCategories(topCategories)
                .monthlyEvolution(monthlyEvolution)
                .build();
    }
}
