package com.estore.admin.service;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.catalog.service.CatalogService;
import com.estore.shared.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final CatalogService catalogService;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public AdminService(CatalogService catalogService,
                        CategoryRepository categoryRepository,
                        ProductRepository productRepository) {
        this.catalogService = catalogService;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public CategoryDto createCategory(CategoryDto request) {
        if (categoryRepository.findByName(request.name()).isPresent()) {
            throw new IllegalArgumentException("Category already exists: " + request.name());
        }
        Category.CategoryBuilder builder = Category.builder()
                .name(request.name())
                .description(request.description());
        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + request.parentId()));
            builder.parent(parent);
        }
        Category category = categoryRepository.save(builder.build());
        return new CategoryDto(category.getId(), category.getName(), category.getDescription(),
                category.getParent() != null ? category.getParent().getId() : null);
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
        return catalogService.updateProduct(id, dto);
    }

    public void deleteProduct(Long id) {
        catalogService.deleteProduct(id);
    }

    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setStock(quantity);
        productRepository.save(product);
    }
}
