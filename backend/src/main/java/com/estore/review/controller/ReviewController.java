package com.estore.review.controller;

import com.estore.review.dto.ReviewDto;
import com.estore.review.service.ReviewService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDto> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(@RequestBody ReviewDto request) {
        ReviewDto review = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Review added successfully", review));
    }
}
