package com.estore.catalog.dto;

public record ProductDto(
        Long id,
        String name,
        Double price,
        String imageUrl,
        String description,
        String categoryName,
        Long categoryId,
        Integer stock
) {}
