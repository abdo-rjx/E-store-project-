package com.estore.catalog.service;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    public CatalogService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<ProductDto> getLatestProducts(int limit) {
        return productRepository.findTop3ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return mapToDto(product);
    }

    public List<ProductDto> searchProducts(String keyword, Long categoryId) {
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = categoryId != null;

        List<Product> products;
        if (hasCategory && hasKeyword) {
            products = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, keyword);
        } else if (hasCategory) {
            products = productRepository.findByCategoryId(categoryId);
        } else if (hasKeyword) {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            products = productRepository.findAll();
        }
        return products.stream().map(this::mapToDto).toList();
    }

    public Page<ProductDto> searchProductsPaginated(String keyword, Long categoryId, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = categoryId != null;

        Page<Product> products;
        if (hasCategory && hasKeyword) {
            products = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, keyword, pageable);
        } else if (hasCategory) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else if (hasKeyword) {
            products = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::mapToDto);
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }

    @Transactional
    public ProductDto createProduct(ProductDto request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));

        Product product = Product.builder()
                .name(request.name())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .description(request.description())
                .category(category)
                .videoPath(request.videoPath())
                .imagePaths(request.imagePaths() != null ? request.imagePaths() : new ArrayList<>())
                .build();

        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(request.stock())
                .build();
        inventoryRepository.save(inventory);

        product.setInventory(inventory);
        return mapToDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        if (request.name() != null) product.setName(request.name());
        if (request.price() != null) product.setPrice(request.price());
        if (request.imageUrl() != null) product.setImageUrl(request.imageUrl());
        if (request.description() != null) product.setDescription(request.description());
        if (request.videoPath() != null) product.setVideoPath(request.videoPath());
        if (request.imagePaths() != null) product.setImagePaths(request.imagePaths());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDto mapToDto(Product product) {
        Inventory inventory = product.getInventory();
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getId() : null,
                inventory != null ? inventory.getQuantity() : 0,
                product.getVideoPath(),
                product.getImagePaths(),
                product.getCreatedAt() != null ? product.getCreatedAt().toString() : null
        );
    }
}
