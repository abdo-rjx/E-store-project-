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
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CartRepository cartRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
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

        // ── Parent Categories ──
        Category electronics = createCategory("Electronic Devices", "Smartphones, laptops, and gadgets", null);
        Category house = createCategory("Electronic House", "Smart home and household electronics", null);
        Category equipment = createCategory("Equipment", "Professional tools and equipment", null);

        // ── Subcategories ──
        Category smartphones = createCategory("Smartphones", "Latest mobile phones", electronics);
        Category laptops = createCategory("Laptops", "Portable computers for work and play", electronics);
        Category audio = createCategory("Audio & Headphones", "Headphones, speakers, and audio gear", electronics);
        Category tablets = createCategory("Tablets & E-Readers", "Tablets and e-readers", electronics);

        Category smartHome = createCategory("Smart Home", "Smart devices for your home", house);
        Category kitchen = createCategory("Kitchen Appliances", "Modern kitchen gadgets", house);
        Category entertainment = createCategory("Home Entertainment", "TVs, soundbars, and media players", house);
        Category lighting = createCategory("Lighting", "Smart lighting solutions", house);

        Category powerTools = createCategory("Power Tools", "Drills, saws, and more", equipment);
        Category office = createCategory("Office Equipment", "Printers, chairs, and accessories", equipment);
        Category measurement = createCategory("Measurement Tools", "Precision measuring instruments", equipment);
        Category safety = createCategory("Safety Gear", "Protective equipment and gear", equipment);

        // ── Electronic Devices: Smartphones ──
        createProduct("iPhone 15", 999.99, "Latest Apple smartphone with A16 chip and 48MP camera",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=iPhone", smartphones, 25);
        createProduct("Samsung Galaxy S24", 899.99, "Samsung flagship with AI features and S Pen support",
                "https://placehold.co/300x300/16213e/ffffff?text=Galaxy", smartphones, 30);
        createProduct("Google Pixel 8", 699.99, "Google's AI-powered phone with amazing camera",
                "https://placehold.co/300x300/0f3460/ffffff?text=Pixel", smartphones, 20);

        // ── Electronic Devices: Laptops ──
        createProduct("MacBook Pro 16", 2499.99, "Apple M3 Pro chip, 18GB RAM, 512GB SSD",
                "https://placehold.co/300x300/533483/ffffff?text=MacBook", laptops, 15);
        createProduct("Dell XPS 15", 1799.99, "Premium Windows laptop with OLED display",
                "https://placehold.co/300x300/e94560/ffffff?text=Dell", laptops, 18);
        createProduct("Lenovo ThinkPad X1", 1599.99, "Business laptop with legendary keyboard",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=ThinkPad", laptops, 12);

        // ── Electronic Devices: Audio & Headphones ──
        createProduct("Sony WH-1000XM5", 349.99, "Industry-leading noise cancelling headphones",
                "https://placehold.co/300x300/16213e/ffffff?text=Sony", audio, 40);
        createProduct("AirPods Pro 2", 249.99, "Apple wireless earbuds with active noise cancellation",
                "https://placehold.co/300x300/0f3460/ffffff?text=AirPods", audio, 50);
        createProduct("JBL Charge 5", 179.99, "Portable Bluetooth speaker with deep bass",
                "https://placehold.co/300x300/533483/ffffff?text=JBL", audio, 35);

        // ── Electronic Devices: Tablets & E-Readers ──
        createProduct("iPad Air M2", 599.99, "Apple iPad with M2 chip and Liquid Retina display",
                "https://placehold.co/300x300/e94560/ffffff?text=iPad", tablets, 22);
        createProduct("Samsung Galaxy Tab S9", 799.99, "Premium Android tablet with S Pen included",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=GalaxyTab", tablets, 16);
        createProduct("Kindle Paperwhite", 139.99, "Waterproof e-reader with adjustable warm light",
                "https://placehold.co/300x300/16213e/ffffff?text=Kindle", tablets, 60);

        // ── Electronic House: Smart Home ──
        createProduct("Nest Thermostat", 129.99, "Smart thermostat that learns your schedule",
                "https://placehold.co/300x300/0f3460/ffffff?text=Nest", smartHome, 45);
        createProduct("Ring Video Doorbell", 99.99, "1080p HD video doorbell with two-way talk",
                "https://placehold.co/300x300/533483/ffffff?text=Ring", smartHome, 38);
        createProduct("Philips Hue Starter Kit", 199.99, "Smart lighting starter kit with 4 bulbs and bridge",
                "https://placehold.co/300x300/e94560/ffffff?text=Hue", smartHome, 25);
        createProduct("Roomba Robot Vacuum", 349.99, "Smart robotic vacuum with mapping technology",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=Roomba", smartHome, 20);

        // ── Electronic House: Kitchen Appliances ──
        createProduct("KitchenAid Stand Mixer", 449.99, "Iconic stand mixer with 5-quart bowl",
                "https://placehold.co/300x300/16213e/ffffff?text=KitchenAid", kitchen, 18);
        createProduct("Instant Pot Duo", 89.99, "7-in-1 programmable pressure cooker",
                "https://placehold.co/300x300/0f3460/ffffff?text=InstantPot", kitchen, 55);
        createProduct("Nespresso Coffee Machine", 179.99, "Premium espresso machine with milk frother",
                "https://placehold.co/300x300/533483/ffffff?text=Nespresso", kitchen, 30);

        // ── Electronic House: Home Entertainment ──
        createProduct("Samsung Smart TV 55\"", 799.99, "4K QLED smart TV with HDR10+",
                "https://placehold.co/300x300/e94560/ffffff?text=SamsungTV", entertainment, 12);
        createProduct("Sonos Arc Soundbar", 899.99, "Premium Dolby Atmos soundbar",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=Sonos", entertainment, 10);
        createProduct("Apple TV 4K", 149.99, "Streaming device with A15 chip and Dolby Vision",
                "https://placehold.co/300x300/16213e/ffffff?text=AppleTV", entertainment, 28);

        // ── Electronic House: Lighting ──
        createProduct("Philips Smart LED Lamp", 49.99, "Dimmable smart desk lamp with multiple color modes",
                "https://placehold.co/300x300/0f3460/ffffff?text=SmartLamp", lighting, 42);
        createProduct("Govee RGBIC LED Strip", 39.99, "Smart LED strip with app control and music sync",
                "https://placehold.co/300x300/533483/ffffff?text=Govee", lighting, 65);

        // ── Equipment: Power Tools ──
        createProduct("DeWalt Cordless Drill", 149.99, "20V max cordless drill with 2 batteries",
                "https://placehold.co/300x300/e94560/ffffff?text=DeWalt", powerTools, 22);
        createProduct("Makita Circular Saw", 179.99, "15-Amp circular saw with electric brake",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=Makita", powerTools, 17);
        createProduct("Bosch Random Orbital Sander", 69.99, "5-inch random orbital sander with dust collection",
                "https://placehold.co/300x300/16213e/ffffff?text=Bosch", powerTools, 30);

        // ── Equipment: Office Equipment ──
        createProduct("Brother Laser Printer", 249.99, "Wireless monochrome laser printer with duplex",
                "https://placehold.co/300x300/0f3460/ffffff?text=Brother", office, 15);
        createProduct("Logitech Webcam C920", 79.99, "Full HD 1080p webcam with autofocus",
                "https://placehold.co/300x300/533483/ffffff?text=Logitech", office, 40);
        createProduct("Herman Miller Aeron Chair", 1399.99, "Ergonomic office chair with adjustable lumbar support",
                "https://placehold.co/300x300/e94560/ffffff?text=HermanMiller", office, 8);

        // ── Equipment: Measurement Tools ──
        createProduct("Stanley Tape Measure 25ft", 24.99, "Durable tape measure with magnetic hook",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=Stanley", measurement, 80);
        createProduct("Digital Caliper 6\"", 34.99, "Stainless steel digital caliper with LCD display",
                "https://placehold.co/300x300/16213e/ffffff?text=Caliper", measurement, 45);
        createProduct("Laser Distance Measurer", 59.99, "165ft laser distance measurer with accuracy +/- 1/16\"",
                "https://placehold.co/300x300/0f3460/ffffff?text=Laser", measurement, 32);

        // ── Equipment: Safety Gear ──
        createProduct("3M Safety Goggles", 14.99, "Anti-fog safety goggles with UV protection",
                "https://placehold.co/300x300/533483/ffffff?text=3M", safety, 100);
        createProduct("Mechanix Work Gloves", 29.99, "Heavy-duty work gloves with reinforced palm",
                "https://placehold.co/300x300/e94560/ffffff?text=Gloves", safety, 75);
        createProduct("Hard Hat Protective Cap", 22.99, "ANSI-rated hard hat with suspension system",
                "https://placehold.co/300x300/1a1a2e/ffffff?text=HardHat", safety, 60);

        // ── Demo Cart for user1 ──
        if (cartRepository.findByUserId(user1.getId()).isEmpty()) {
            Product demoProduct = productRepository.findByName("iPhone 15").orElse(null);
            if (demoProduct != null) {
                Cart cart1 = new Cart();
                cart1.setUser(user1);
                cart1.setCreatedAt(LocalDateTime.now());
                cart1 = cartRepository.save(cart1);

                CartItem ci1 = new CartItem();
                ci1.setProduct(demoProduct);
                ci1.setQuantity(1);
                ci1.setUnitPrice(demoProduct.getPrice());
                ci1.setCart(cart1);
                cart1.setItems(List.of(ci1));
                cartRepository.save(cart1);
            }
        }

        log.info("Demo data initialized successfully!");
        log.info("Accounts: admin@estore.com / admin123, omar@test.com / user123, fatima@test.com / user123");
    }

    private User createUser(String first, String last, String email, String role) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get();
        }
        String password = role.equals("ADMIN") ? "admin123" : "user123";
        User user = User.builder()
                .firstName(first)
                .lastName(last)
                .email(email)
                .password(passwordEncoder.encode(password))
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

    private Category createCategory(String name, String description, Category parent) {
        if (categoryRepository.findByName(name).isPresent()) {
            return categoryRepository.findByName(name).get();
        }
        Category category = Category.builder()
                .name(name)
                .description(description)
                .parent(parent)
                .build();
        return categoryRepository.save(category);
    }

    private Product createProduct(String name, Double price, String desc, String imageUrl, Category category, Integer stock) {
        Product product = productRepository.findByName(name).orElse(new Product());
        product.setName(name);
        product.setPrice(price);
        product.setDescription(desc);
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        product.setStock(stock);
        return productRepository.save(product);
    }
}