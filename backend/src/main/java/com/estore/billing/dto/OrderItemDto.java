package com.estore.billing.dto;

public record OrderItemDto(
        Long id,
        Long productId,
        String productName,
        Double unitPrice,
        Integer quantity,
        Double subtotal
) {}
