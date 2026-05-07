# E-Store Project Map

## SYSTEM_FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ANGULAR FRONTEND                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │   Auth   │ │ Catalog  │ │   Cart   │ │  Orders  │ │  Profile  │ │
│  │Components│ │Components│ │Components│ │Components│ │Components │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│                              │                                       │
│                    ┌─────────▼─────────┐                             │
│                    │  HTTP Services +  │                             │
│                    │  JWT Interceptor  │                             │
│                    └─────────┬─────────┘                             │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ REST API (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SPRING BOOT BACKEND                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                         │   │
│  │  ┌────────┐ ┌─────────┐ ┌────────┐ ┌───────┐ ┌──────┐       │   │
│  │  │ Auth   │ │Product  │ │ Cart   │ │Order  │ │Review│       │   │
│  │  │Control.│ │Control. │ │Control.│ │Control│ │Ctrl  │       │   │
│  │  └────────┘ └─────────┘ └────────┘ └───────┘ └──────┘       │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │                    BUSINESS LAYER                             │   │
│  │  ┌────────┐ ┌─────────┐ ┌────────┐ ┌───────┐ ┌──────┐       │   │
│  │  │ Auth   │ │Catalog  │ │Shopping│ │Billing│ │Review│       │   │
│  │  │Service │ │Service  │ │Service │ │Service│ │Service│      │   │
│  │  └────────┘ └─────────┘ └────────┘ └───────┘ └──────┘       │   │
│  │                          │                                    │   │
│  │                    JWT + Security                             │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │                    DATA ACCESS LAYER                          │   │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐   │   │
│  │  │   JPA Repositories  │  │    MongoDB Repository        │   │   │
│  │  │  (H2 - Relational)  │  │   (Document - Reviews)       │   │   │
│  │  │                     │  │                               │   │   │
│  │  │ User, Profile       │  │  ProductReview Document       │   │   │
│  │  │ Category, Product   │  │                               │   │   │
│  │  │ Inventory           │  │                               │   │   │
│  │  │ Cart, CartItem      │  │                               │   │   │
│  │  │ Order, OrderItem    │  │                               │   │   │
│  │  └─────────────────────┘  └──────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Domain Flow
```
Customer Domain          Catalog Domain          Inventory Domain
├─ Register              ├─ List Products        ├─ Check Stock
├─ Login (JWT)           ├─ Product Detail       ├─ Update Stock
├─ View Profile          ├─ Search/Filter        └─ Stock Validation
└─ Update Profile        └─ Categories

Shopping Domain          Billing Domain          Review Domain (MongoDB)
├─ View Cart             ├─ Create Order         ├─ Add Review
├─ Add to Cart           ├─ Order History        ├─ Get Product Reviews
├─ Update Quantity       └─ Order Status         └─ Review Validation
├─ Remove Item
└─ Calculate Total
```

### Request Flow Example: Place Order
```
1. User clicks "Checkout" → Angular Order Service
2. POST /api/orders → OrderController
3. OrderService.validateOrder(userId)
   a. Get cart → CartRepository
   b. Validate cart not empty
   c. For each cart item:
      - Check inventory → InventoryService.checkStock()
      - If insufficient → throw InsufficientStockException
   d. Create Order + OrderItems
   e. Update inventory → InventoryService.decrementStock()
   f. Clear cart
4. Return Order DTO → Angular displays confirmation
```

## TECH_STACK

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 (LTS) | Runtime |
| Spring Boot | 3.4.5 | Framework |
| Spring Data JPA | 3.4.x | ORM / Relational Data |
| Spring Security | 6.4.x | Authentication & Authorization |
| H2 Database | 2.3.x | Embedded Relational DB |
| Spring Data MongoDB | 4.4.x | Document Data Access |
| MongoDB | 7.x/8.x | Document Database (Reviews) |
| JJWT | 0.12.6 | JWT Token Generation & Validation |
| Lombok | 1.18.36 | Boilerplate Reduction |
| Maven | 3.9.x | Build Tool |
| Bean Validation | 3.0.x | Input Validation |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 19.x | Frontend Framework |
| Angular Material | 19.x | UI Component Library |
| TypeScript | 5.6.x | Type Safety |
| RxJS | 7.8.x | Reactive Programming |
| Node.js | 20.x LTS | Runtime |
| Swiper.js | latest | Carousel/Slider functionality |

### Testing
| Technology | Scope | Files |
|---|---|---|
| JUnit 5 | Unit tests | CatalogServiceTest, ShoppingServiceTest, BillingServiceTest |
| Mockito | Mocking | @Mock, @InjectMocks, verify() |
| AssertJ | Assertions | assertThat(), hasSize(), isEqualTo() |
| Total | 29 tests | All passing |

### Architecture
- **Pattern**: Layered Architecture + Domain-Driven Design
- **Backend Packages**: Organized by domain (customer, catalog, inventory, shopping, billing, review)
- **Frontend Structure**: Feature-based modules (auth, catalog, cart, orders, profile, admin)
- **Communication**: REST API with JSON
- **Auth**: JWT Bearer Token

### Domains
| Domain | Responsibility | Key Entities |
|---|---|---|
| Customer | Account management, authentication | User, Profile |
| Catalog | Product browsing, search, categories | Product, Category |
| Inventory | Stock management | Inventory |
| Shopping | Cart operations | Cart, CartItem |
| Billing | Order processing, history | Order, OrderItem |
| Review | Product reviews (MongoDB) | ProductReview |

### New Components (Latest Update)
| Component/Service | Location | Purpose |
|---|---|---|
| `FileStorageService` | `backend/shared/storage/` | Handle file uploads (video + images) with validation |
| `WebMvcConfig` | `backend/shared/config/` | Serve uploaded files via `/uploads/**` |
| `HomeComponent` | `frontend/features/home/` | Landing page with video slider for latest 3 products |
| `HeroComponent` | `frontend/shared/components/hero/` | Full-screen hero with scroll-driven animations |
| `StickySectionComponent` | `frontend/shared/components/sticky-section/` | Apple-style sticky visual sections |
| `ProductShowcaseComponent` | `frontend/shared/components/product-showcase/` | Featured products grid with reveal animations |
| `ScrollAnimationService` | `frontend/shared/animations/` | Global scroll progress tracking + IntersectionObserver |
| `ScrollRevealDirective` | `frontend/shared/animations/` | `appScrollReveal` directive for fade-up/scale/slide animations |

### Product Entity Updates
| Field | Type | Description |
|---|---|---|
| `videoPath` | String (nullable) | Path to promotional video (e.g., `/uploads/videos/abc.mp4`) |
| `imagePaths` | List\<String\> | Multiple image paths (1-5 images) |
| `createdAt` | LocalDateTime | Auto-set timestamp for sorting latest products |

### New API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/latest` | Get latest 3 products (for video slider) |
| POST | `/api/admin/products/upload` | Create product with video + images (multipart) |
