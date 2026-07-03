package com.expensetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private Double totalExpenses;
    private Double currentMonthExpenses;
    private Long totalExpenseCount;
    private Map<String, Double> expensesByCategory;
    private List<CategorySumDto> topCategories;
    private Map<String, Double> monthlyEvolution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySumDto {
        private String categoryName;
        private String color;
        private String icon;
        private Double totalAmount;
        private Double percentage;
    }
}
