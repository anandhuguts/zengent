package com.zengent.demo.mapper;

import com.zengent.demo.dto.CategoryDto;
import com.zengent.demo.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.stereotype.Component;

/**
 * MapStruct mapper for Category entity and DTO conversions.
 * Handles hierarchical mapping for parent-child relationships.
 */
@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
@Component
public interface CategoryMapper {
    
    /**
     * Convert Category entity to CategoryDto.
     */
    CategoryDto toDto(Category category);
    
    /**
     * Convert CategoryDto to Category entity.
     */
    Category toEntity(CategoryDto categoryDto);
    
    /**
     * Update existing Category entity with data from CategoryDto.
     */
    Category updateEntity(CategoryDto categoryDto, @MappingTarget Category category);
}