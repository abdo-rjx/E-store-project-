package com.estore.catalog.dto;

import java.util.List;

public record ProductDto(
        Long id,
        String name,
        Double price,
        String imageUrl,
        String description,
        String categoryName,
        Long categoryId,
        Integer stock,
        String videoPath,
        List<String> imagePaths,
        String createdAt
) {
    // Constructor for backward compatibility (without new fields)
    public ProductDto(Long id, String name, Double price, String imageUrl, String description,
                      String categoryName, Long categoryId, Integer stock) {
        this(id, name, price, imageUrl, description, categoryName, categoryId, stock, null, List.of(), null);
    }
}
