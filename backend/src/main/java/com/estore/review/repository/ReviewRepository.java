package com.estore.review.repository;

import com.estore.review.document.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<ProductReview, String> {
    Page<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    List<ProductReview> findByUserId(Long userId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
