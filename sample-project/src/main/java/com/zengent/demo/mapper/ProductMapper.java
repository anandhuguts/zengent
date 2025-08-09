package com.zengent.demo.mapper;

import com.zengent.demo.dto.ProductDto;
import com.zengent.demo.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.stereotype.Component;

/**
 * MapStruct mapper for Product entity and DTO conversions.
 * Demonstrates advanced mapping patterns and custom conversions.
 */
@Mapper(componentModel = "spring", 
        uses = {CategoryMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
@Component
public interface ProductMapper {
    
    /**
     * Convert Product entity to ProductDto.
     */
    ProductDto toDto(Product product);
    
    /**
     * Convert ProductDto to Product entity.
     */
    Product toEntity(ProductDto productDto);
    
    /**
     * Update existing Product entity with data from ProductDto.
     * Ignores null values in the DTO.
     */
    Product updateEntity(ProductDto productDto, @MappingTarget Product product);
}