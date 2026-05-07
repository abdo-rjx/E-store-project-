package com.estore.shopping.dto;

public record CartItemDto(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        Double unitPrice,
        Integer quantity,
        Double subtotal
) {}
