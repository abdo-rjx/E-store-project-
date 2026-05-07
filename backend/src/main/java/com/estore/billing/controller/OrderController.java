package com.estore.billing.controller;

import com.estore.billing.dto.OrderDto;
import com.estore.billing.service.BillingService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final BillingService billingService;

    public OrderController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(@RequestParam Long userId) {
        OrderDto order = billingService.placeOrder(userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders(@PathVariable Long userId) {
        List<OrderDto> orders = billingService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable Long id) {
        OrderDto order = billingService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }
}
