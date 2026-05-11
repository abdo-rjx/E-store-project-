package com.estore.catalog.repository;

import com.estore.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    Page<Product> findByStockGreaterThan(Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdAndStockGreaterThan(Long categoryId, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdInAndStockGreaterThan(List<Long> categoryIds, Integer minStock, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndStockGreaterThan(String keyword, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingIgnoreCaseAndStockGreaterThan(Long categoryId, String keyword, Integer minStock, Pageable pageable);
    Page<Product> findByCategoryIdInAndNameContainingIgnoreCaseAndStockGreaterThan(List<Long> categoryIds, String keyword, Integer minStock, Pageable pageable);
}