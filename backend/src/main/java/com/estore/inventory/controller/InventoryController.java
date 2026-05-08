package com.estore.inventory.controller;

import com.estore.inventory.service.InventoryService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<Integer>> getStock(@PathVariable Long productId) {
        Integer stock = inventoryService.getStock(productId);
        return ResponseEntity.ok(ApiResponse.ok("Stock retrieved", stock));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        inventoryService.updateStock(productId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated", null));
    }
}
