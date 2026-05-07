package com.estore.catalog.controller;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.service.CatalogService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
