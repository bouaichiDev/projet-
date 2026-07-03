package com.expensetracker.repository;

import com.expensetracker.entity.MonthlyBudget;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {
    Optional<MonthlyBudget> findByUserAndMonthAndYear(User user, Integer month, Integer year);
}
