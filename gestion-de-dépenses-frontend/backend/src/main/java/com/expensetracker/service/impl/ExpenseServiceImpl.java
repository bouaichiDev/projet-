package com.expensetracker.service.impl;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.ExpenseMapper;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.interfaces.ExpenseService;
import com.expensetracker.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseMapper expenseMapper;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    public List<ExpenseResponse> getAllExpenses() {
        User currentUser = securityUtils.getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserOrderByExpenseDateDesc(currentUser);
        return expenseMapper.toResponseList(expenses);
    }

    @Override
    public ExpenseResponse getExpenseById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Expense expense = expenseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));
        return expenseMapper.toResponse(expense);
    }

    @Override
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(request.getCategoryId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));

        Expense expense = expenseMapper.toEntity(request);
        expense.setCategory(category);
        expense.setUser(currentUser);

        Expense savedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Expense expense = expenseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));

        Category category = categoryRepository.findByIdAndUser(request.getCategoryId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategory(category);

        Expense updatedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Expense expense = expenseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));
        expenseRepository.delete(expense);
    }

    @Override
    public List<ExpenseResponse> filterExpenses(Long categoryId, LocalDate startDate, LocalDate endDate, Double minAmount, Double maxAmount) {
        User currentUser = securityUtils.getCurrentUser();
        List<Expense> expenses = expenseRepository.filterExpenses(currentUser, categoryId, startDate, endDate, minAmount, maxAmount);
        return expenseMapper.toResponseList(expenses);
    }
}
