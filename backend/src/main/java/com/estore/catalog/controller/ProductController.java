package com.estore.catalog.controller;

import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.service.CatalogService;
import com.estore.shared.model.ApiResponse;
import com.estore.shared.model.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final CatalogService catalogService;

    public ProductController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        ProductDto product = catalogService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDto>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId) {
        List<ProductDto> products = catalogService.searchProducts(keyword, categoryId);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProductsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        if (sortBy == null) sortBy = "id";
        if (sortDirection == null) sortDirection = "desc";
        Sort sort = resolveSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductDto> result = catalogService.searchProductsPaginated(keyword, categoryId, inStock, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(result)));
    }

    private Sort resolveSort(String sortBy, String sortDirection) {
        String field = switch (sortBy) {
            case "price" -> "price";
            case "name" -> "name";
            case "createdAt" -> "createdAt";
            case "featured" -> "featured";
            default -> "id";
        };
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    @GetMapping("/random")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getRandomProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getRandomProducts(page, size)));
    }

    // NEW: Get latest 3 products for video slider on home page
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getLatestProducts() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getLatestProducts(3)));
    }
}
