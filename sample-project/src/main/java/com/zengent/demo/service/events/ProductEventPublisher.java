package com.zengent.demo.service.events;

import com.zengent.demo.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Event publisher for product-related events.
 * Demonstrates event-driven architecture patterns.
 */
@Component
public class ProductEventPublisher {
    
    private final ApplicationEventPublisher eventPublisher;
    
    @Autowired
    public ProductEventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    
    public void publishProductCreated(Product product) {
        eventPublisher.publishEvent(new ProductCreatedEvent(product));
    }
    
    public void publishStockUpdated(Product product, int quantity) {
        eventPublisher.publishEvent(new StockUpdatedEvent(product, quantity));
    }
    
    public void publishProductDeactivated(Product product) {
        eventPublisher.publishEvent(new ProductDeactivatedEvent(product));
    }
    
    // Event classes
    public static class ProductCreatedEvent {
        private final Product product;
        
        public ProductCreatedEvent(Product product) {
            this.product = product;
        }
        
        public Product getProduct() { return product; }
    }
    
    public static class StockUpdatedEvent {
        private final Product product;
        private final int quantity;
        
        public StockUpdatedEvent(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }
        
        public Product getProduct() { return product; }
        public int getQuantity() { return quantity; }
    }
    
    public static class ProductDeactivatedEvent {
        private final Product product;
        
        public ProductDeactivatedEvent(Product product) {
            this.product = product;
        }
        
        public Product getProduct() { return product; }
    }
}