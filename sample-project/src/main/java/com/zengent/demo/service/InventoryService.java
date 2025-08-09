package com.zengent.demo.service;

import com.zengent.demo.model.Product;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for complex inventory management operations.
 * Demonstrates service composition and business logic encapsulation.
 */
@Service
@Transactional
public class InventoryService {
    
    /**
     * Update product stock with business rules validation.
     */
    public void updateProductStock(Product product, int quantity) {
        if (quantity < 0 && Math.abs(quantity) > product.getStockQuantity()) {
            throw new IllegalStateException("Cannot reduce stock below zero");
        }
        
        product.updateStock(quantity);
        
        // Additional business logic for stock management
        if (product.getStockQuantity() <= 5) {
            // Trigger low stock notification
            notifyLowStock(product);
        }
    }
    
    /**
     * Reserve stock for pending orders.
     */
    public boolean reserveStock(Product product, int quantity) {
        if (product.getStockQuantity() >= quantity) {
            product.reduceStock(quantity);
            return true;
        }
        return false;
    }
    
    /**
     * Release reserved stock for cancelled orders.
     */
    public void releaseReservedStock(Product product, int quantity) {
        product.updateStock(quantity);
    }
    
    private void notifyLowStock(Product product) {
        // Low stock notification logic
        System.out.println("Low stock alert for product: " + product.getName());
    }
}