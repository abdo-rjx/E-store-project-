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
    List<Product> findByNameContainingIgnoreCase(String keyword);
    List<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword);

    Page<Product> findAll(Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    Page<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword, Pageable pageable);

    // NEW: Find latest 3 products for video slider
    List<Product> findTop3ByOrderByCreatedAtDesc();
}
