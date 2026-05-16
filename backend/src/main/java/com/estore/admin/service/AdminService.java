package com.estore.admin.service;

import com.estore.catalog.dto.CategoryDto;
import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.catalog.service.CatalogService;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shared.model.PageResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ProductDto toggleFeatured(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setFeatured(!product.isFeatured());
        Product saved = productRepository.save(product);
        return catalogService.getProductById(saved.getId());
    }

    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setStock(quantity);
        productRepository.save(product);
    }

    public PageResponse<ProductDto> getProductsAdmin(String keyword, Long categoryId, String stockFilter, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "id");
        Page<ProductDto> result = catalogService.searchProductsAdmin(keyword, categoryId, stockFilter,
                PageRequest.of(page, size, sort));
        return PageResponse.from(result);
    }

    /**
     * Export all products to CSV with all fields including name, description, and imageUrl
     */
    public String exportProductsCsv() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.builder()
                .setHeader("id", "name", "category", "description", "price", "stock", "imageUrl")
                .build())) {
            for (Product p : products) {
                printer.printRecord(
                    p.getId(),
                    p.getName(),
                    p.getCategory() != null ? p.getCategory().getName() : "",
                    p.getDescription() != null ? p.getDescription() : "",
                    p.getPrice(),
                    p.getStock(),
                    p.getImageUrl() != null ? p.getImageUrl() : ""
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
        }
        return sw.toString();
    }

    /**
     * Import products from CSV with support for:
     * - Updating existing products by ID (price, stock, name, description, imageUrl)
     * - Creating new products if ID doesn't exist (requires: name, category, price, stock)
     * 
     * Expected CSV headers: id, name, category, description, price, stock, imageUrl
     */
    @Transactional
    public Map<String, Object> importProductsCsv(MultipartFile file) {
        int updated = 0;
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        long lineNum = 1;

        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader().setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true).setTrim(true).build())) {

            for (CSVRecord record : parser) {
                lineNum = parser.getCurrentLineNumber();
                try {
                    String idStr = safeGet(record, "id");
                    String name = safeGet(record, "name");
                    String categoryName = safeGet(record, "category");
                    String description = safeGet(record, "description");
                    String priceStr = safeGet(record, "price");
                    String stockStr = safeGet(record, "stock");
                    String imageUrl = safeGet(record, "imageUrl");

                    // Check if product exists by ID
                    Optional<Product> opt = !idStr.isBlank() ? productRepository.findById(Long.parseLong(idStr.trim())) : Optional.empty();

                    if (opt.isPresent()) {
                        // UPDATE existing product
                        Product product = opt.get();
                        
                        if (name != null && !name.isBlank()) {
                            product.setName(name);
                        }
                        if (description != null && !description.isBlank()) {
                            product.setDescription(description);
                        }
                        if (imageUrl != null && !imageUrl.isBlank()) {
                            product.setImageUrl(imageUrl);
                        }
                        if (priceStr != null && !priceStr.isBlank()) {
                            product.setPrice(Double.parseDouble(priceStr));
                        }
                        if (stockStr != null && !stockStr.isBlank()) {
                            product.setStock(Integer.parseInt(stockStr));
                        }
                        // Optionally update category if provided
                        if (categoryName != null && !categoryName.isBlank()) {
                            Optional<Category> category = categoryRepository.findByName(categoryName);
                            if (category.isPresent()) {
                                product.setCategory(category.get());
                            }
                        }
                        
                        productRepository.save(product);
                        updated++;
                    } else {
                        // CREATE new product (or skip if required fields missing)
                        if (name == null || name.isBlank()) {
                            errors.add("Row " + lineNum + ": missing required field 'name' for new product");
                            skipped++;
                            continue;
                        }
                        if (categoryName == null || categoryName.isBlank()) {
                            errors.add("Row " + lineNum + ": missing required field 'category' for new product");
                            skipped++;
                            continue;
                        }
                        if (priceStr == null || priceStr.isBlank()) {
                            errors.add("Row " + lineNum + ": missing required field 'price' for new product");
                            skipped++;
                            continue;
                        }

                        Double price = Double.parseDouble(priceStr);
                        Integer stock = 100; // default
                        if (stockStr != null && !stockStr.isBlank()) {
                            stock = Integer.parseInt(stockStr);
                        }

                        Optional<Category> category = categoryRepository.findByName(categoryName);
                        if (category.isEmpty()) {
                            errors.add("Row " + lineNum + ": category '" + categoryName + "' not found");
                            skipped++;
                            continue;
                        }

                        Product newProduct = Product.builder()
                                .name(name)
                                .price(price)
                                .stock(stock)
                                .category(category.get())
                                .description(description != null && !description.isBlank() ? description : null)
                                .imageUrl(imageUrl != null && !imageUrl.isBlank() ? imageUrl : null)
                                .featured(false)
                                .build();

                        productRepository.save(newProduct);
                        created++;
                    }
                } catch (NumberFormatException e) {
                    errors.add("Row " + lineNum + ": invalid number — " + e.getMessage());
                    skipped++;
                } catch (Exception e) {
                    errors.add("Row " + lineNum + ": " + e.getMessage());
                    skipped++;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV import failed: " + e.getMessage(), e);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("created", created);
        result.put("updated", updated);
        result.put("skipped", skipped);
        result.put("errors", errors);
        return result;
    }

    private String safeGet(CSVRecord record, String name) {
        try { return record.get(name); } catch (Exception e) { return null; }
    }
}
