package com.expensetracker.mapper;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.entity.Expense;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-03T15:11:17+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ExpenseMapperImpl implements ExpenseMapper {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public ExpenseResponse toResponse(Expense expense) {
        if ( expense == null ) {
            return null;
        }

        ExpenseResponse.ExpenseResponseBuilder expenseResponse = ExpenseResponse.builder();

        expenseResponse.amount( expense.getAmount() );
        expenseResponse.category( categoryMapper.toResponse( expense.getCategory() ) );
        expenseResponse.createdAt( expense.getCreatedAt() );
        expenseResponse.description( expense.getDescription() );
        expenseResponse.expenseDate( expense.getExpenseDate() );
        expenseResponse.id( expense.getId() );
        expenseResponse.title( expense.getTitle() );
        expenseResponse.updatedAt( expense.getUpdatedAt() );

        return expenseResponse.build();
    }

    @Override
    public List<ExpenseResponse> toResponseList(List<Expense> expenses) {
        if ( expenses == null ) {
            return null;
        }

        List<ExpenseResponse> list = new ArrayList<ExpenseResponse>( expenses.size() );
        for ( Expense expense : expenses ) {
            list.add( toResponse( expense ) );
        }

        return list;
    }

    @Override
    public Expense toEntity(ExpenseRequest request) {
        if ( request == null ) {
            return null;
        }

        Expense.ExpenseBuilder expense = Expense.builder();

        expense.amount( request.getAmount() );
        expense.description( request.getDescription() );
        expense.expenseDate( request.getExpenseDate() );
        expense.title( request.getTitle() );

        return expense.build();
    }
}
