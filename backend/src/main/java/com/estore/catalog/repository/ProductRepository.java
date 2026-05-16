package com.estore.catalog.repository;

import com.estore.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryIdIn(List<Long> categoryIds);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    List<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword);
    List<Product> findByCategoryIdInAndNameContainingIgnoreCase(List<Long> categoryIds, String keyword);

    Page<Product> findAll(Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByCategoryIdIn(List<Long> categoryIds, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword, Pageable pageable);
    Page<Product> findByCategoryIdInAndNameContainingIgnoreCase(List<Long> categoryIds, String keyword, Pageable pageable);

    List<Product> findTop3ByOrderByCreatedAtDesc();

    Optional<Product> findFirstByCategoryIdAndFeaturedTrue(Long categoryId);

    Page<Product> findByStockGreaterThan(Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdAndStockGreaterThan(Long categoryId, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdInAndStockGreaterThan(List<Long> categoryIds, Integer minStock, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndStockGreaterThan(String keyword, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingIgnoreCaseAndStockGreaterThan(Long categoryId, String keyword, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdInAndNameContainingIgnoreCaseAndStockGreaterThan(List<Long> categoryIds, String keyword, Integer minStock, Pageable pageable);

    /** Admin flexible query — handles keyword, stockMin, stockMax all optional */
    @Query("SELECT p FROM Product p WHERE " +
        "(COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
        "(:stockMin IS NULL OR p.stock >= :stockMin) AND " +
        "(:stockMax IS NULL OR p.stock <= :stockMax)")
    Page<Product> findWithFilters(
        @Param("keyword") String keyword,
        @Param("stockMin") Integer stockMin,
        @Param("stockMax") Integer stockMax,
        Pageable pageable);

    /** Admin flexible query — with category constraint */
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND " +
        "(COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
        "(:stockMin IS NULL OR p.stock >= :stockMin) AND " +
        "(:stockMax IS NULL OR p.stock <= :stockMax)")
    Page<Product> findWithFiltersAndCategory(
        @Param("keyword") String keyword,
        @Param("categoryIds") List<Long> categoryIds,
        @Param("stockMin") Integer stockMin,
        @Param("stockMax") Integer stockMax,
        Pageable pageable);
}