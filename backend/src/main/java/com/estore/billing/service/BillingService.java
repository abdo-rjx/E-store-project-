package com.estore.billing.service;

import com.estore.billing.dto.OrderDto;
import com.estore.billing.dto.OrderItemDto;
import com.estore.billing.entity.Order;
import com.estore.billing.entity.OrderItem;
import com.estore.billing.repository.OrderRepository;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shopping.dto.CartDto;
import com.estore.shopping.dto.CartItemDto;
import com.estore.shopping.service.ShoppingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillingService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShoppingService shoppingService;
    private final ProductRepository productRepository;

    public BillingService(OrderRepository orderRepository,
                          UserRepository userRepository,
                          ShoppingService shoppingService,
                          ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.shoppingService = shoppingService;
        this.productRepository = productRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public OrderDto placeOrder(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        CartDto cart = shoppingService.getCart(userId);

        if (cart.items() == null || cart.items().isEmpty()) {
            throw new IllegalArgumentException("Cannot place order with empty cart");
        }

        // Validate stock first
        for (CartItemDto item : cart.items()) {
            Product prod = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));
            if (prod.getStock() < item.quantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + item.productName());
            }
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(cart.total())
                .status("CONFIRMED")
                .items(new ArrayList<>())
                .build();

        for (CartItemDto item : cart.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.quantity())
                    .unitPrice(item.unitPrice())
                    .build();

            product.setStock(product.getStock() - item.quantity());
            productRepository.save(product);

            order.getItems().add(orderItem);
        }

        order = orderRepository.save(order);
        shoppingService.clearCart(userId);

        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return orders.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return mapToDto(order);
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getUnitPrice() * item.getQuantity()
                ))
                .toList();

        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getStatus(),
                items
        );
    }
}
