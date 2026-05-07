package com.estore.shopping.controller;

import com.estore.shopping.dto.CartDto;
import com.estore.shopping.service.ShoppingService;
import com.estore.shared.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final ShoppingService shoppingService;

    public CartController(ShoppingService shoppingService) {
        this.shoppingService = shoppingService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(shoppingService.getCart(userId)));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        CartDto cart = shoppingService.addToCart(userId, productId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @RequestParam Long userId,
            @RequestParam Long itemId,
            @RequestParam Integer quantity) {
        CartDto cart = shoppingService.updateQuantity(userId, itemId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeFromCart(
            @RequestParam Long userId,
            @PathVariable Long itemId) {
        CartDto cart = shoppingService.removeFromCart(userId, itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }
}
