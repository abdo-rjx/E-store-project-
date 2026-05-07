package com.estore.customer.dto;

public record ProfileDto(
        Long id,
        String phone,
        String address,
        String city,
        String country
) {}
