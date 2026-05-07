package com.estore.shopping.dto;

import java.util.List;

public record CartDto(
        Long id,
        Long userId,
        List<CartItemDto> items,
        Double total
) {}
