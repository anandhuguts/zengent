package com.zengent.demo.controller;

import com.zengent.demo.model.Product;
import com.zengent.demo.model.Category;
import com.zengent.demo.service.ProductService;
import com.zengent.demo.dto.ProductDto;
import com.zengent.demo.mapper.ProductMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller for Product management operations.
 * Demonstrates comprehensive REST API design with Swagger documentation.
 */
@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Management", description = "Operations for managing products")
@Validated
public class ProductController {
    
    private final ProductService productService;
    private final ProductMapper productMapper;
    
    @Autowired
    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }
    
    @Operation(summary = "Get all products", description = "Retrieve a paginated list of all active products")
    @GetMapping
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<Product> products = productService.findAll(pageable);
        Page<ProductDto> productDtos = products.map(productMapper::toDto);
        return ResponseEntity.ok(productDtos);
    }
    
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id) {
        return productService.findById(id)
                .map(productMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Operation(summary = "Create new product", description = "Create a new product in the system")
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        Product savedProduct = productService.createProduct(product);
        ProductDto savedProductDto = productMapper.toDto(savedProduct);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProductDto);
    }
    
    @Operation(summary = "Update product", description = "Update an existing product")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Valid @RequestBody ProductDto productDto) {
        return productService.findById(id)
                .map(existingProduct -> {
                    Product updatedProduct = productMapper.updateEntity(productDto, existingProduct);
                    Product savedProduct = productService.updateProduct(updatedProduct);
                    return ResponseEntity.ok(productMapper.toDto(savedProduct));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Operation(summary = "Search products", description = "Search products by name, description, or SKU")
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto>> searchProducts(
            @Parameter(description = "Search term") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Product> products = productService.searchProducts(q, pageable);
        Page<ProductDto> productDtos = products.map(productMapper::toDto);
        return ResponseEntity.ok(productDtos);
    }
    
    @Operation(summary = "Get products by category", description = "Retrieve products belonging to a specific category")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductDto>> getProductsByCategory(
            @Parameter(description = "Category ID") @PathVariable @Min(1) Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        // Implementation would fetch category and then products
        return ResponseEntity.ok().build(); // Simplified for demo
    }
    
    @Operation(summary = "Get products by price range", description = "Find products within a specified price range")
    @GetMapping("/price-range")
    public ResponseEntity<List<ProductDto>> getProductsByPriceRange(
            @Parameter(description = "Minimum price") @RequestParam BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam BigDecimal maxPrice) {
        List<Product> products = productService.findByPriceRange(minPrice, maxPrice);
        List<ProductDto> productDtos = products.stream()
                .map(productMapper::toDto)
                .toList();
        return ResponseEntity.ok(productDtos);
    }
    
    @Operation(summary = "Update product stock", description = "Update the stock quantity of a product")
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> updateStock(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Parameter(description = "Quantity to add/subtract") @RequestParam int quantity) {
        productService.updateStock(id, quantity);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Get featured products", description = "Retrieve featured products for homepage display")
    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> getFeaturedProducts() {
        List<Product> products = productService.getFeaturedProducts();
        List<ProductDto> productDtos = products.stream()
                .map(productMapper::toDto)
                .toList();
        return ResponseEntity.ok(productDtos);
    }
    
    @Operation(summary = "Get low stock products", description = "Retrieve products with stock below threshold")
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDto>> getLowStockProducts(
            @Parameter(description = "Stock threshold") @RequestParam(defaultValue = "10") int threshold) {
        List<Product> products = productService.getLowStockProducts(threshold);
        List<ProductDto> productDtos = products.stream()
                .map(productMapper::toDto)
                .toList();
        return ResponseEntity.ok(productDtos);
    }
    
    @Operation(summary = "Deactivate product", description = "Deactivate a product (soft delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateProduct(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Get inventory value", description = "Calculate total inventory value")
    @GetMapping("/inventory-value")
    public ResponseEntity<BigDecimal> getInventoryValue() {
        BigDecimal value = productService.calculateTotalInventoryValue();
        return ResponseEntity.ok(value);
    }
}