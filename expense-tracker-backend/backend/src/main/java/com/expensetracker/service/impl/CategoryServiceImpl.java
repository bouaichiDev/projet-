package com.expensetracker.service.impl;

import com.expensetracker.dto.request.CategoryRequest;
import com.expensetracker.dto.response.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.CategoryMapper;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.service.interfaces.CategoryService;
import com.expensetracker.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    public List<CategoryResponse> getAllCategories() {
        User currentUser = securityUtils.getCurrentUser();
        List<Category> categories = categoryRepository.findByUser(currentUser);
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (categoryRepository.existsByNameIgnoreCaseAndUser(request.getName(), currentUser)) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = categoryMapper.toEntity(request);
        category.setUser(currentUser);

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));

        // Check name uniqueness if changed
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByNameIgnoreCaseAndUser(request.getName(), currentUser)) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = securityUtils.getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));

        try {
            categoryRepository.delete(category);
        } catch (Exception ex) {
            throw new BadRequestException("Cannot delete category as it is linked to one or more expenses.");
        }
    }
}
