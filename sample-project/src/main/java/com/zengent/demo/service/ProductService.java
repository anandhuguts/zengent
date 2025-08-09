package com.zengent.demo.service;

import com.zengent.demo.model.Product;
import com.zengent.demo.model.Category;
import com.zengent.demo.repository.ProductRepository;
import com.zengent.demo.repository.CategoryRepository;
import com.zengent.demo.service.events.ProductEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Product-related business operations.
 * Demonstrates advanced service patterns, caching, and event publishing.
 */
@Service
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductEventPublisher eventPublisher;
    private final InventoryService inventoryService;
    
    @Autowired
    public ProductService(ProductRepository productRepository, 
                         CategoryRepository categoryRepository,
                         ProductEventPublisher eventPublisher,
                         InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.eventPublisher = eventPublisher;
        this.inventoryService = inventoryService;
    }
    
    /**
     * Create a new product with validation and event publishing.
     */
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product) {
        // Validate category exists
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }
        
        // Validate unique SKU
        if (productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("Product with SKU already exists: " + product.getSku());
        }
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishProductCreated(savedProduct);
        
        return savedProduct;
    }
    
    /**
     * Find product by ID with caching.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }
    
    /**
     * Find products by category with pagination.
     */
    @Transactional(readOnly = true)
    public Page<Product> findByCategory(Category category, Pageable pageable) {
        return productRepository.findByCategoryAndIsActiveTrue(category, pageable);
    }
    
    /**
     * Search products by name or description.
     */
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String searchTerm, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            searchTerm, searchTerm, pageable);
    }
    
    /**
     * Find products within price range.
     */
    @Transactional(readOnly = true)
    public List<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetweenAndIsActiveTrue(minPrice, maxPrice);
    }
    
    /**
     * Update product stock with inventory service integration.
     */
    @CacheEvict(value = "products", key = "#productId")
    public void updateStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        // Use inventory service for complex stock management
        inventoryService.updateProductStock(product, quantity);
        
        productRepository.save(product);
        eventPublisher.publishStockUpdated(product, quantity);
    }
    
    /**
     * Deactivate product instead of deleting.
     */
    @CacheEvict(value = "products", key = "#productId")
    public void deactivateProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        product.setIsActive(false);
        productRepository.save(product);
        eventPublisher.publishProductDeactivated(product);
    }
    
    /**
     * Get featured products for homepage.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "featuredProducts")
    public List<Product> getFeaturedProducts() {
        return productRepository.findTop10ByIsActiveTrueOrderByCreatedAtDesc();
    }
    
    /**
     * Calculate total inventory value.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalInventoryValue() {
        return productRepository.calculateTotalInventoryValue();
    }
    
    /**
     * Get low stock products for alerts.
     */
    @Transactional(readOnly = true)
    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockQuantityLessThanAndIsActiveTrue(threshold);
    }
}