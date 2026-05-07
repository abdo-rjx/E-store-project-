package com.estore.admin.controller;

import com.estore.admin.service.AdminService;
import com.estore.catalog.dto.ProductDto;
import com.estore.shared.model.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto request) {
        ProductDto product = adminService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created", product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto request) {
        ProductDto product = adminService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated", product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted", null));
    }

    @PutMapping("/inventory/{productId}")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        adminService.updateStock(productId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated", null));
    }
}
