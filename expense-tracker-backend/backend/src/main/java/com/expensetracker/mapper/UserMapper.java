package com.expensetracker.mapper;

import com.expensetracker.dto.response.UserResponse;
import com.expensetracker.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
