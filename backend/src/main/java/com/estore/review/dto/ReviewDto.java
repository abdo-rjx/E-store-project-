package com.estore.review.dto;

import java.time.LocalDateTime;

public record ReviewDto(
        String id,
        Long productId,
        Long userId,
        String authorName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {}
