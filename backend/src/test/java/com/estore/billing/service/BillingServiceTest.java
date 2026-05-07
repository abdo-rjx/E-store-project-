package com.estore.billing.service;

import com.estore.billing.entity.Order;
import com.estore.billing.entity.OrderItem;
import com.estore.billing.repository.OrderRepository;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.service.InventoryService;
import com.estore.shopping.dto.CartDto;
import com.estore.shopping.dto.CartItemDto;
import com.estore.shopping.service.ShoppingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShoppingService shoppingService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private BillingService billingService;

    private User user;
    private CartDto cartWithItems;
    private CartDto emptyCart;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@test.com")
                .firstName("Test")
                .lastName("User")
                .role("USER")
                .password("encoded")
                .build();

        CartItemDto item1 = new CartItemDto(1L, 1L, "iPhone 15", "https://placehold.co/300", 999.99, 2, 1999.98);
        CartItemDto item2 = new CartItemDto(2L, 2L, "Galaxy S24", "https://placehold.co/300", 899.99, 1, 899.99);
        cartWithItems = new CartDto(1L, 1L, List.of(item1, item2), 2899.97);

        emptyCart = new CartDto(1L, 1L, List.of(), 0.0);
    }

    @Test
    void placeOrder_shouldCreateOrder_whenCartHasItemsAndStockAvailable() {
        Category category = Category.builder().id(1L).name("Electronics").build();
        Product product1 = Product.builder().id(1L).name("iPhone 15").price(999.99).category(category).build();
        Product product2 = Product.builder().id(2L).name("Galaxy S24").price(899.99).category(category).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shoppingService.getCart(1L)).thenReturn(cartWithItems);
        when(inventoryService.hasStock(1L, 2)).thenReturn(true);
        when(inventoryService.hasStock(2L, 1)).thenReturn(true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(100L);
            return savedOrder;
        });
        doNothing().when(shoppingService).clearCart(1L);

        var result = billingService.placeOrder(1L);

        assertThat(result).isNotNull();
        assertThat(result.totalAmount()).isEqualTo(2899.97);
        assertThat(result.status()).isEqualTo("CONFIRMED");
        assertThat(result.items()).hasSize(2);

        verify(inventoryService).decrementStock(1L, 2);
        verify(inventoryService).decrementStock(2L, 1);
        verify(shoppingService).clearCart(1L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void placeOrder_shouldThrowException_whenCartIsEmpty() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shoppingService.getCart(1L)).thenReturn(emptyCart);

        assertThatThrownBy(() -> billingService.placeOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty cart");

        verify(orderRepository, never()).save(any());
        verify(inventoryService, never()).decrementStock(anyLong(), anyInt());
    }

    @Test
    void placeOrder_shouldThrowException_whenStockInsufficient() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shoppingService.getCart(1L)).thenReturn(cartWithItems);
        when(inventoryService.hasStock(1L, 2)).thenReturn(false);

        assertThatThrownBy(() -> billingService.placeOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient stock");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void placeOrder_shouldThrowException_whenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billingService.placeOrder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getUserOrders_shouldReturnOrdersSortedByDate() {
        Order order1 = Order.builder()
                .id(1L)
                .user(user)
                .totalAmount(100.0)
                .status("CONFIRMED")
                .build();
        Order order2 = Order.builder()
                .id(2L)
                .user(user)
                .totalAmount(200.0)
                .status("CONFIRMED")
                .build();

        when(orderRepository.findByUserIdOrderByOrderDateDesc(1L)).thenReturn(List.of(order2, order1));

        var result = billingService.getUserOrders(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).totalAmount()).isEqualTo(200.0);
        verify(orderRepository).findByUserIdOrderByOrderDateDesc(1L);
    }

    @Test
    void getUserOrders_shouldReturnEmptyList_whenNoOrders() {
        when(orderRepository.findByUserIdOrderByOrderDateDesc(1L)).thenReturn(List.of());

        var result = billingService.getUserOrders(1L);

        assertThat(result).isEmpty();
    }

    @Test
    void getOrderById_shouldReturnOrder_whenExists() {
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .totalAmount(500.0)
                .status("CONFIRMED")
                .items(List.of())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        var result = billingService.getOrderById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.totalAmount()).isEqualTo(500.0);
    }

    @Test
    void getOrderById_shouldThrowException_whenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billingService.getOrderById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Order not found");
    }
}
