package com.estore.catalog.controller;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.service.CatalogService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CatalogService catalogService;

    public CategoryController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllCategories()));
    }

    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getParentCategories() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getParentCategories()));
    }

    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getSubCategories(@PathVariable Long parentId) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getSubCategories(parentId)));
    }
}
