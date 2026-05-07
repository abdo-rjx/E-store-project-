package com.estore.inventory.service;

import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shared.exception.InsufficientStockException;
import com.estore.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public boolean hasStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
        return inventory.getQuantity() >= quantity;
    }

    @Transactional
    public void decrementStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));

        if (inventory.getQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
        inventory.setQuantity(quantity);
        inventoryRepository.save(inventory);
    }

    public Integer getStock(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
        return inventory.getQuantity();
    }
}
