package com.estore.catalog.service;

import com.estore.billing.repository.OrderItemRepository;
import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shared.model.PageResponse;
import com.estore.shopping.repository.CartItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    public CatalogService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          CartItemRepository cartItemRepository,
                          OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<ProductDto> getLatestProducts(int limit) {
        return Stream.of(7L, 1L, 2L)
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(this::mapToDto)
                .toList();
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return mapToDto(product);
    }

    private List<Long> resolveCategoryIds(Long categoryId) {
        if (categoryId == null) return List.of();
        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        List<Category> subs = categoryRepository.findByParentId(categoryId);
        for (Category sub : subs) {
            ids.add(sub.getId());
        }
        return ids;
    }

    public List<ProductDto> searchProducts(String keyword, Long categoryId) {
        List<Long> catIds = resolveCategoryIds(categoryId);
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = !catIds.isEmpty();

        List<Product> products;
        if (hasCategory && hasKeyword) {
            products = productRepository.findByCategoryIdInAndNameContainingIgnoreCase(catIds, keyword);
        } else if (hasCategory) {
            products = productRepository.findByCategoryIdIn(catIds);
        } else if (hasKeyword) {
            products = productRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            products = productRepository.findAll();
        }
        return products.stream().map(this::mapToDto).toList();
    }

    public Page<ProductDto> searchProductsPaginated(String keyword, Long categoryId, Boolean inStock, Pageable pageable) {
        List<Long> catIds = resolveCategoryIds(categoryId);
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = !catIds.isEmpty();
        boolean filterStock = Boolean.TRUE.equals(inStock);

        Page<Product> products;
        if (filterStock) {
            if (hasCategory && hasKeyword) {
                products = productRepository.findByCategoryIdInAndNameContainingIgnoreCaseAndStockGreaterThan(catIds, keyword, 0, pageable);
            } else if (hasCategory) {
                products = productRepository.findByCategoryIdInAndStockGreaterThan(catIds, 0, pageable);
            } else if (hasKeyword) {
                products = productRepository.findByNameContainingIgnoreCaseAndStockGreaterThan(keyword, 0, pageable);
            } else {
                products = productRepository.findByStockGreaterThan(0, pageable);
            }
        } else {
            if (hasCategory && hasKeyword) {
                products = productRepository.findByCategoryIdInAndNameContainingIgnoreCase(catIds, keyword, pageable);
            } else if (hasCategory) {
                products = productRepository.findByCategoryIdIn(catIds, pageable);
            } else if (hasKeyword) {
                products = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
            } else {
                products = productRepository.findAll(pageable);
            }
        }
        return products.map(this::mapToDto);
    }

    /**
     * Admin-only paginated search with optional stockFilter:
     * "all" | "inStock" (stock>0) | "lowStock" (1-5) | "outOfStock" (stock=0)
     */
    public Page<ProductDto> searchProductsAdmin(String keyword, Long categoryId, String stockFilter, Pageable pageable) {
        Integer stockMin = null;
        Integer stockMax = null;
        if ("inStock".equals(stockFilter))    { stockMin = 1; }
        else if ("lowStock".equals(stockFilter))  { stockMin = 1; stockMax = 5; }
        else if ("outOfStock".equals(stockFilter)) { stockMin = 0; stockMax = 0; }

        List<Long> catIds = resolveCategoryIds(categoryId);
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        Page<Product> products;
        if (!catIds.isEmpty()) {
            products = productRepository.findWithFiltersAndCategory(kw, catIds, stockMin, stockMax, pageable);
        } else {
            products = productRepository.findWithFilters(kw, stockMin, stockMax, pageable);
        }
        return products.map(this::mapToDto);
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapCategoryToDto)
                .toList();
    }

    public List<CategoryDto> getParentCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapCategoryToDto)
                .toList();
    }

    public List<CategoryDto> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::mapCategoryToDto)
                .toList();
    }

    private CategoryDto mapCategoryToDto(Category c) {
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getParent() != null ? c.getParent().getId() : null
        );
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
                .stock(request.stock() != null ? request.stock() : 100)
                .videoPath(request.videoPath())
                .imagePaths(request.imagePaths() != null ? request.imagePaths() : new ArrayList<>())
                .build();

        return mapToDto(productRepository.save(product));
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
        if (request.stock() != null) product.setStock(request.stock());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
            product.setCategory(category);
        }

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        cartItemRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        productRepository.deleteById(id);
    }

    public PageResponse<ProductDto> getRandomProducts(int page, int size) {
        List<Product> all = productRepository.findAll();
        Collections.shuffle(all);
        long total = all.size();
        int start = page * size;
        if (start >= total) {
            return new PageResponse<>(List.of(), page, size, total, (int) Math.ceil((double) total / size), true);
        }
        int end = Math.min(start + size, all.size());
        List<ProductDto> content = all.subList(start, end).stream()
                .map(this::mapToDto)
                .toList();
        int totalPages = (int) Math.ceil((double) total / size);
        return new PageResponse<>(content, page, size, total, totalPages, end >= total);
    }

    private ProductDto mapToDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getStock(),
                product.getVideoPath(),
                product.getImagePaths(),
                product.getCreatedAt() != null ? product.getCreatedAt().toString() : null,
                product.isFeatured()
        );
    }
}
