package com.estore.shopping.service;

import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.shared.exception.InsufficientStockException;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shopping.dto.CartDto;
import com.estore.shopping.dto.CartItemDto;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShoppingService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public ShoppingService(CartRepository cartRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CartDto getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(createCartForUser(userId)));
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStock() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .cart(cart)
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto updateQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (item.getProduct().getStock() < quantity) {
                throw new InsufficientStockException("Insufficient stock");
            }
            item.setQuantity(quantity);
        }

        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto removeFromCart(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private Cart createCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return Cart.builder()
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private CartDto mapToDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream()
                .map(item -> new CartItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getUnitPrice() * item.getQuantity()
                ))
                .toList();

        double total = items.stream().mapToDouble(CartItemDto::subtotal).sum();

        return new CartDto(cart.getId(), cart.getUser().getId(), items, total);
    }
}
