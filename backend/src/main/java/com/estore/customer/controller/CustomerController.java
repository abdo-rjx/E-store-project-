package com.estore.customer.controller;

import com.estore.customer.dto.ProfileDto;
import com.estore.customer.service.CustomerService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileDto>> getProfile(Authentication auth) {
        ProfileDto profile = customerService.getProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileDto>> updateProfile(
            Authentication auth,
            @RequestBody ProfileDto request) {
        ProfileDto updated = customerService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
