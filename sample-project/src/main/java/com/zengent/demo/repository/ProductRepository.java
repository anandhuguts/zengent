package com.zengent.demo.repository;

import com.zengent.demo.model.Product;
import com.zengent.demo.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Product entity operations.
 * Demonstrates advanced JPA query methods and custom queries.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Basic finder methods
    boolean existsBySku(String sku);
    
    List<Product> findByIsActiveTrue();
    
    Page<Product> findByCategoryAndIsActiveTrue(Category category, Pageable pageable);
    
    // Search methods
    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String name, String description, Pageable pageable);
    
    // Price range queries
    List<Product> findByPriceBetweenAndIsActiveTrue(BigDecimal minPrice, BigDecimal maxPrice);
    
    List<Product> findByPriceGreaterThanAndIsActiveTrue(BigDecimal price);
    
    List<Product> findByPriceLessThanAndIsActiveTrue(BigDecimal price);
    
    // Stock management
    List<Product> findByStockQuantityLessThanAndIsActiveTrue(int threshold);
    
    List<Product> findByStockQuantityGreaterThanAndIsActiveTrue(int threshold);
    
    // Featured and popular products
    List<Product> findTop10ByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Product> findTop5ByIsActiveTrueOrderByPriceAsc();
    
    List<Product> findTop5ByIsActiveTrueOrderByPriceDesc();
    
    // Category-based queries
    List<Product> findByCategoryInAndIsActiveTrue(List<Category> categories);
    
    // Custom queries with @Query annotation
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(p.name LIKE %:searchTerm% OR p.description LIKE %:searchTerm% OR p.sku LIKE %:searchTerm%)")
    Page<Product> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT SUM(p.price * p.stockQuantity) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValue();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category = :category AND p.isActive = true")
    long countActiveProductsByCategory(@Param("category") Category category);
    
    @Query("SELECT p FROM Product p JOIN p.reviews r WHERE r.rating >= :minRating AND p.isActive = true " +
           "GROUP BY p HAVING AVG(r.rating) >= :minRating ORDER BY AVG(r.rating) DESC")
    List<Product> findHighRatedProducts(@Param("minRating") double minRating);
    
    // Native query example
    @Query(value = "SELECT * FROM products p WHERE p.is_active = true AND " +
                   "p.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)", nativeQuery = true)
    List<Product> findRecentProducts(@Param("days") int days);
}