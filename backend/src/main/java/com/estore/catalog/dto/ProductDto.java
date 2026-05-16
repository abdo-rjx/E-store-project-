package com.estore.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record ProductDto(
        Long id,
        @NotBlank String name,
        @NotNull @Positive Double price,
        String imageUrl,
        String description,
        String categoryName,
        @NotNull Long categoryId,
        Integer stock,
        String videoPath,
        List<String> imagePaths,
        String createdAt,
        Boolean featured
) {
    public ProductDto(Long id, String name, Double price, String imageUrl, String description,
                      String categoryName, Long categoryId, Integer stock) {
        this(id, name, price, imageUrl, description, categoryName, categoryId, stock, null, List.of(), null, null);
    }

    public ProductDto(Long id, String name, Double price, String imageUrl, String description,
                      String categoryName, Long categoryId, Integer stock,
                      String videoPath, List<String> imagePaths, String createdAt) {
        this(id, name, price, imageUrl, description, categoryName, categoryId, stock, videoPath, imagePaths, createdAt, null);
    }
}
