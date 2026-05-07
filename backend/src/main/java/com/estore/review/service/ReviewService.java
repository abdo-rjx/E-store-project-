package com.estore.review.service;

import com.estore.catalog.repository.ProductRepository;
import com.estore.review.document.ProductReview;
import com.estore.review.dto.ReviewDto;
import com.estore.review.repository.ReviewRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public Page<ReviewDto> getProductReviews(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(this::mapToDto);
    }

    public ReviewDto createReview(ReviewDto request) {
        if (!productRepository.existsById(request.productId())) {
            throw new ResourceNotFoundException("Product not found: " + request.productId());
        }

        if (reviewRepository.existsByProductIdAndUserId(request.productId(), request.userId())) {
            throw new IllegalArgumentException("User already reviewed this product");
        }

        ProductReview review = ProductReview.builder()
                .productId(request.productId())
                .userId(request.userId())
                .authorName(request.authorName())
                .rating(request.rating())
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);
        return mapToDto(review);
    }

    private ReviewDto mapToDto(ProductReview review) {
        return new ReviewDto(
                review.getId(),
                review.getProductId(),
                review.getUserId(),
                review.getAuthorName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
