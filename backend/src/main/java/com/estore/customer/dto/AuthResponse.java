package com.estore.customer.dto;

public record AuthResponse(
        String token,
        String email,
        String firstName,
        String lastName,
        String role,
        Long userId
) {}
