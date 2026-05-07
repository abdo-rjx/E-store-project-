package com.estore.admin.service;

import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.service.CatalogService;
import com.estore.inventory.service.InventoryService;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final CatalogService catalogService;
    private final InventoryService inventoryService;

    public AdminService(CatalogService catalogService, InventoryService inventoryService) {
        this.catalogService = catalogService;
        this.inventoryService = inventoryService;
    }

    public ProductDto createProduct(ProductDto request) {
        return catalogService.createProduct(request);
    }

    public ProductDto updateProduct(Long id, ProductDto request) {
        return catalogService.updateProduct(id, request);
    }

    public void deleteProduct(Long id) {
        catalogService.deleteProduct(id);
    }

    public void updateStock(Long productId, Integer quantity) {
        inventoryService.updateStock(productId, quantity);
    }
}
