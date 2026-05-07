package com.estore.shopping.service;

import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.service.InventoryService;
import com.estore.shopping.dto.CartDto;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShoppingServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private ShoppingService shoppingService;

    private User user;
    private Product product;
    private Cart cart;

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

        Category category = Category.builder().id(1L).name("Electronics").build();

        product = Product.builder()
                .id(1L)
                .name("iPhone 15")
                .price(999.99)
                .imageUrl("https://placehold.co/300x300")
                .description("Phone")
                .category(category)
                .build();

        cart = Cart.builder()
                .id(1L)
                .user(user)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();
    }

    @Test
    void getCart_shouldReturnExistingCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        CartDto result = shoppingService.getCart(1L);

        assertThat(result).isNotNull();
        assertThat(result.userId()).isEqualTo(1L);
        verify(cartRepository).findByUserId(1L);
    }

    @Test
    void getCart_shouldCreateNewCart_whenNoCartExists() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.getCart(1L);

        assertThat(result).isNotNull();
        assertThat(result.userId()).isEqualTo(1L);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addToCart_shouldAddNewItem_whenProductNotInCart() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryService.hasStock(1L, 2)).thenReturn(true);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.addToCart(1L, 1L, 2);

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).quantity()).isEqualTo(2);
        assertThat(result.items().get(0).unitPrice()).isEqualTo(999.99);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addToCart_shouldIncreaseQuantity_whenProductAlreadyInCart() {
        CartItem existingItem = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(1)
                .unitPrice(999.99)
                .cart(cart)
                .build();
        cart.getItems().add(existingItem);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryService.hasStock(1L, 2)).thenReturn(true);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.addToCart(1L, 1L, 2);

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).quantity()).isEqualTo(3);
    }

    @Test
    void addToCart_shouldThrowException_whenInsufficientStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryService.hasStock(1L, 100)).thenReturn(false);

        assertThatThrownBy(() -> shoppingService.addToCart(1L, 1L, 100))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient stock");

        verify(cartRepository, never()).save(any());
    }

    @Test
    void addToCart_shouldThrowException_whenProductNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shoppingService.addToCart(1L, 99L, 1))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void updateQuantity_shouldUpdateQuantity_whenItemExists() {
        CartItem item = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(2)
                .unitPrice(999.99)
                .cart(cart)
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(inventoryService.hasStock(1L, 5)).thenReturn(true);
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.updateQuantity(1L, 10L, 5);

        assertThat(result.items().get(0).quantity()).isEqualTo(5);
    }

    @Test
    void updateQuantity_shouldRemoveItem_whenQuantityIsZero() {
        CartItem item = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(2)
                .unitPrice(999.99)
                .cart(cart)
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.updateQuantity(1L, 10L, 0);

        assertThat(result.items()).isEmpty();
    }

    @Test
    void removeFromCart_shouldRemoveItem() {
        CartItem item = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(1)
                .unitPrice(999.99)
                .cart(cart)
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartDto result = shoppingService.removeFromCart(1L, 10L);

        assertThat(result.items()).isEmpty();
    }

    @Test
    void getCart_shouldCalculateTotalCorrectly() {
        CartItem item1 = CartItem.builder()
                .id(10L)
                .product(product)
                .quantity(2)
                .unitPrice(100.0)
                .cart(cart)
                .build();
        CartItem item2 = CartItem.builder()
                .id(11L)
                .product(Product.builder().id(2L).name("Accessory").price(50.0).build())
                .quantity(1)
                .unitPrice(50.0)
                .cart(cart)
                .build();
        cart.getItems().add(item1);
        cart.getItems().add(item2);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        CartDto result = shoppingService.getCart(1L);

        assertThat(result.total()).isEqualTo(250.0);
    }
}
