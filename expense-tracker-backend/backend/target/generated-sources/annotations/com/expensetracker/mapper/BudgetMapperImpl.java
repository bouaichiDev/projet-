package com.expensetracker.mapper;

import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.entity.MonthlyBudget;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-02T16:32:07+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class BudgetMapperImpl implements BudgetMapper {

    @Override
    public BudgetResponse toResponse(MonthlyBudget budget) {
        if ( budget == null ) {
            return null;
        }

        BudgetResponse.BudgetResponseBuilder budgetResponse = BudgetResponse.builder();

        budgetResponse.id( budget.getId() );
        budgetResponse.amount( budget.getAmount() );
        budgetResponse.month( budget.getMonth() );
        budgetResponse.year( budget.getYear() );
        budgetResponse.createdAt( budget.getCreatedAt() );
        budgetResponse.updatedAt( budget.getUpdatedAt() );

        return budgetResponse.build();
    }

    @Override
    public MonthlyBudget toEntity(BudgetRequest request) {
        if ( request == null ) {
            return null;
        }

        MonthlyBudget.MonthlyBudgetBuilder monthlyBudget = MonthlyBudget.builder();

        monthlyBudget.amount( request.getAmount() );
        monthlyBudget.month( request.getMonth() );
        monthlyBudget.year( request.getYear() );

        return monthlyBudget.build();
    }
}
