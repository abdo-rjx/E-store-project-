package com.estore.review.repository;

import com.estore.review.document.ProductReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<ProductReview, String> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<ProductReview> findByUserId(Long userId);
}
