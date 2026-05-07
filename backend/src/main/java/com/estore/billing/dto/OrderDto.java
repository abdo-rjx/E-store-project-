package com.estore.billing.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        Long userId,
        String userEmail,
        LocalDateTime orderDate,
        Double totalAmount,
        String status,
        List<OrderItemDto> items
) {}
