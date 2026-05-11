package com.estore.catalog.dto;

public record CategoryDto(
        Long id,
        String name,
        String description,
        Long parentId
) {
    public CategoryDto(Long id, String name, String description) {
        this(id, name, description, null);
    }
}
