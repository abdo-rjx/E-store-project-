package com.estore.admin.controller;

import com.estore.admin.service.AdminService;
import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.shared.model.ApiResponse;
import com.estore.shared.storage.FileStorageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;
    private final FileStorageService fileStorageService;

    public AdminController(AdminService adminService, FileStorageService fileStorageService) {
        this.adminService = adminService;
        this.fileStorageService = fileStorageService;
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

    @PutMapping(value = "/products/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDto>> updateProductWithFiles(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "stock", defaultValue = "0") Integer stock,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        log.info("Received update request for product {} with video={} and {} images",
                id, video != null ? video.getOriginalFilename() : "none",
                images != null ? images.length : 0);

        try {
            String videoPath = null;
            if (video != null && !video.isEmpty()) {
                videoPath = fileStorageService.storeVideo(video);
            }

            List<String> imagePaths = new ArrayList<>();
            if (images != null && images.length > 0) {
                int maxImages = Math.min(images.length, 5);
                for (int i = 0; i < maxImages; i++) {
                    if (!images[i].isEmpty()) {
                        imagePaths.add(fileStorageService.storeImage(images[i]));
                    }
                }
            }

            ProductDto product = adminService.updateProductWithFiles(id, name, price, description, categoryId, stock, videoPath, imagePaths);

            return ResponseEntity.ok(ApiResponse.ok("Product updated with media files", product));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), null));
        } catch (RuntimeException e) {
            log.error("Storage error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@RequestBody CategoryDto request) {
        CategoryDto category = adminService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created", category));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody ProductDto request) {
        ProductDto product = adminService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created", product));
    }

    @PostMapping(value = "/products/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDto>> createProductWithFiles(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "stock", defaultValue = "0") Integer stock,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        log.info("Received create request with video={} and {} images",
                video != null ? video.getOriginalFilename() : "none",
                images != null ? images.length : 0);

        try {
            String videoPath = null;
            if (video != null && !video.isEmpty()) {
                videoPath = fileStorageService.storeVideo(video);
            }

            List<String> imagePaths = new ArrayList<>();
            if (images != null && images.length > 0) {
                int maxImages = Math.min(images.length, 5);
                for (int i = 0; i < maxImages; i++) {
                    if (!images[i].isEmpty()) {
                        imagePaths.add(fileStorageService.storeImage(images[i]));
                    }
                }
            }

            String imageUrl = imagePaths.isEmpty() ? null : imagePaths.get(0);

            ProductDto product = adminService.createProduct(new ProductDto(
                    null, name, price, imageUrl, description, null, categoryId, stock, videoPath, imagePaths, null
            ));

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Product created with media files", product));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), null));
        } catch (RuntimeException e) {
            log.error("Storage error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage(), null));
        }
    }
}
