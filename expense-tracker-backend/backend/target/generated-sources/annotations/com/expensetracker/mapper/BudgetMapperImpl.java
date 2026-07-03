package com.expensetracker.mapper;

import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.entity.MonthlyBudget;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-03T15:11:17+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class BudgetMapperImpl implements BudgetMapper {

    @Override
    public BudgetResponse toResponse(MonthlyBudget budget) {
        if ( budget == null ) {
            return null;
        }

        BudgetResponse.BudgetResponseBuilder budgetResponse = BudgetResponse.builder();

        budgetResponse.amount( budget.getAmount() );
        budgetResponse.createdAt( budget.getCreatedAt() );
        budgetResponse.id( budget.getId() );
        budgetResponse.month( budget.getMonth() );
        budgetResponse.updatedAt( budget.getUpdatedAt() );
        budgetResponse.year( budget.getYear() );

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
