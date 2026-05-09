package com.estore.admin.service;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.service.CatalogService;
import com.estore.inventory.service.InventoryService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final CatalogService catalogService;
    private final InventoryService inventoryService;
    private final CategoryRepository categoryRepository;

    public AdminService(CatalogService catalogService, InventoryService inventoryService,
                        CategoryRepository categoryRepository) {
        this.catalogService = catalogService;
        this.inventoryService = inventoryService;
        this.categoryRepository = categoryRepository;
    }

    public CategoryDto createCategory(CategoryDto request) {
        if (categoryRepository.findByName(request.name()).isPresent()) {
            throw new IllegalArgumentException("Category already exists: " + request.name());
        }
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .build();
        category = categoryRepository.save(category);
        return new CategoryDto(category.getId(), category.getName(), category.getDescription());
    }

    public ProductDto createProduct(ProductDto request) {
        return catalogService.createProduct(request);
    }

    public ProductDto updateProduct(Long id, ProductDto request) {
        return catalogService.updateProduct(id, request);
    }

    @Transactional
    public ProductDto updateProductWithFiles(Long id, String name, Double price, String description,
                                             Long categoryId, Integer stock, String videoPath,
                                             java.util.List<String> imagePaths) {
        ProductDto existing = catalogService.getProductById(id);

        List<String> finalImages = imagePaths != null && !imagePaths.isEmpty()
                ? new ArrayList<>(imagePaths)
                : (existing.imagePaths() != null ? new ArrayList<>(existing.imagePaths()) : new ArrayList<>());

        String finalVideo = videoPath != null ? videoPath : existing.videoPath();
        String finalImage = imagePaths != null && !imagePaths.isEmpty() ? imagePaths.get(0) : existing.imageUrl();

        ProductDto dto = new ProductDto(id, name, price, finalImage, description, null, categoryId, stock, finalVideo, finalImages, null);
        catalogService.updateProduct(id, dto);

        if (stock != null) {
            inventoryService.updateStock(id, stock);
        }

        return catalogService.getProductById(id);
    }

    public void deleteProduct(Long id) {
        catalogService.deleteProduct(id);
    }

    public void updateStock(Long productId, Integer quantity) {
        inventoryService.updateStock(productId, quantity);
    }
}
