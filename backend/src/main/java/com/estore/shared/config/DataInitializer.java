package com.estore.shared.config;

import com.estore.billing.entity.Order;
import com.estore.billing.entity.OrderItem;
import com.estore.billing.repository.OrderRepository;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           CartRepository cartRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing demo data...");

        User admin = createUser("Admin", "User", "admin@estore.com", "ADMIN");
        User user1 = createUser("Omar", "Zahour", "omar@test.com", "USER");
        User user2 = createUser("Fatima", "Alami", "fatima@test.com", "USER");

        Category electronics = createCategory("Electronics", "Phones, laptops, and gadgets");
        Category books = createCategory("Books", "Technical and fiction books");
        Category clothing = createCategory("Clothing", "Men and women fashion");

        Product p1 = createProduct("iPhone 15", 999.99, "Latest Apple smartphone with advanced camera", "https://placehold.co/300x300/1a1a2e/ffffff?text=iPhone", electronics, 25);
        Product p2 = createProduct("Samsung Galaxy S24", 899.99, "Samsung flagship with AI features", "https://placehold.co/300x300/16213e/ffffff?text=Galaxy", electronics, 30);
        Product p3 = createProduct("Laptop Pro 16", 1499.99, "Professional laptop for developers", "https://placehold.co/300x300/0f3460/ffffff?text=Laptop", electronics, 15);
        Product p4 = createProduct("Spring in Action", 49.99, "Comprehensive guide to Spring Framework", "https://placehold.co/300x300/533483/ffffff?text=Spring", books, 50);
        Product p5 = createProduct("Clean Code", 39.99, "A handbook of agile software craftsmanship", "https://placehold.co/300x300/e94560/ffffff?text=Code", books, 40);
        Product p6 = createProduct("Running Shoes", 89.99, "Comfortable shoes for daily running", "https://placehold.co/300x300/1a1a2e/ffffff?text=Shoes", clothing, 60);

        Cart cart1 = new Cart();
        cart1.setUser(user1);
        cart1.setCreatedAt(LocalDateTime.now());
        cart1 = cartRepository.save(cart1);

        CartItem ci1 = new CartItem();
        ci1.setProduct(p1);
        ci1.setQuantity(1);
        ci1.setUnitPrice(p1.getPrice());
        ci1.setCart(cart1);
        cart1.setItems(List.of(ci1));
        cartRepository.save(cart1);

        log.info("Demo data initialized successfully!");
        log.info("Accounts: admin@estore.com / admin123, omar@test.com / user123, fatima@test.com / user123");
    }

    private User createUser(String first, String last, String email, String role) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get();
        }
        User user = User.builder()
                .firstName(first)
                .lastName(last)
                .email(email)
                .password(passwordEncoder.encode("user123"))
                .role(role)
                .build();
        Profile profile = Profile.builder()
                .user(user)
                .phone("+212600000000")
                .address("123 Demo Street")
                .city("Casablanca")
                .country("Morocco")
                .build();
        user.setProfile(profile);
        return userRepository.save(user);
    }

    private Category createCategory(String name, String description) {
        return categoryRepository.save(Category.builder()
                .name(name)
                .description(description)
                .build());
    }

    private Product createProduct(String name, Double price, String desc, String imageUrl, Category category, Integer stock) {
        Product product = Product.builder()
                .name(name)
                .price(price)
                .description(desc)
                .imageUrl(imageUrl)
                .category(category)
                .build();
        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(stock)
                .build();
        inventoryRepository.save(inventory);
        product.setInventory(inventory);

        return product;
    }
}
