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

@RestController
@RequestMapping("/api/products")
public class ProductController {

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
            @RequestParam(required = false) Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ProductDto> result = catalogService.searchProductsPaginated(keyword, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(result)));
    }

    // NEW: Get latest 3 products for video slider on home page
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getLatestProducts() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getLatestProducts(3)));
    }
}
