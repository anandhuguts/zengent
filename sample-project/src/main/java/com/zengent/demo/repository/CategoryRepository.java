package com.zengent.demo.repository;

import com.zengent.demo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Category entity operations.
 * Demonstrates hierarchical data queries and tree structures.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Basic finder methods
    List<Category> findByIsActiveTrue();
    
    List<Category> findByNameContainingIgnoreCase(String name);
    
    // Hierarchical queries
    List<Category> findByParentIsNullAndIsActiveTrue();
    
    List<Category> findByParentAndIsActiveTrue(Category parent);
    
    List<Category> findByParentIdAndIsActiveTrue(Long parentId);
    
    // Sorting and ordering
    List<Category> findByIsActiveTrueOrderBySortOrder();
    
    List<Category> findByParentIsNullAndIsActiveTrueOrderBySortOrder();
    
    // Custom queries for tree operations
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.sortOrder")
    List<Category> findRootCategories();
    
    @Query("SELECT c FROM Category c WHERE c.parent = :parent AND c.isActive = true ORDER BY c.sortOrder")
    List<Category> findChildCategories(@Param("parent") Category parent);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.parent = :parent AND c.isActive = true")
    long countChildCategories(@Param("parent") Category parent);
    
    // Check if category has products
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p WHERE p.category = :category AND p.isActive = true")
    boolean hasActiveProducts(@Param("category") Category category);
    
    // Recursive query to get all descendants (for databases that support CTEs)
    @Query(value = "WITH RECURSIVE category_tree AS (" +
                   "SELECT id, name, parent_id, 0 as level FROM categories WHERE id = :categoryId " +
                   "UNION ALL " +
                   "SELECT c.id, c.name, c.parent_id, ct.level + 1 " +
                   "FROM categories c INNER JOIN category_tree ct ON c.parent_id = ct.id" +
                   ") SELECT * FROM category_tree", nativeQuery = true)
    List<Object[]> findCategoryTreeRecursive(@Param("categoryId") Long categoryId);
}