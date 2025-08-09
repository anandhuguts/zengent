package com.zengent.demo.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * Data Transfer Object for Category entity.
 * Demonstrates hierarchical DTO structures.
 */
public class CategoryDto {
    
    private Long id;
    
    @NotNull
    @Size(min = 1, max = 255)
    private String name;
    
    @Size(max = 500)
    private String description;
    
    private CategoryDto parent;
    
    private List<CategoryDto> children;
    
    private Integer sortOrder;
    
    private Boolean isActive;
    
    // Constructors
    public CategoryDto() {}
    
    public CategoryDto(String name) {
        this.name = name;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public CategoryDto getParent() { return parent; }
    public void setParent(CategoryDto parent) { this.parent = parent; }
    
    public List<CategoryDto> getChildren() { return children; }
    public void setChildren(List<CategoryDto> children) { this.children = children; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}