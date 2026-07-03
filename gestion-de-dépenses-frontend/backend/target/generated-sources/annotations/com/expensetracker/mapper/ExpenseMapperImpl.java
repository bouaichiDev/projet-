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
    date = "2026-07-03T15:46:42+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
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

        expenseResponse.id( expense.getId() );
        expenseResponse.title( expense.getTitle() );
        expenseResponse.description( expense.getDescription() );
        expenseResponse.amount( expense.getAmount() );
        expenseResponse.expenseDate( expense.getExpenseDate() );
        expenseResponse.category( categoryMapper.toResponse( expense.getCategory() ) );
        expenseResponse.createdAt( expense.getCreatedAt() );
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

        expense.title( request.getTitle() );
        expense.description( request.getDescription() );
        expense.amount( request.getAmount() );
        expense.expenseDate( request.getExpenseDate() );

        return expense.build();
    }
}
