# E-Store - Full Stack E-Commerce Platform

Mini-projet Full Stack: Spring Boot + JPA + MongoDB + Angular

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Node.js | 20.x LTS |
| npm | 10.x |
| MongoDB | 7.x / 8.x |
| Maven | 3.9+ |

## Project Structure

```
estore/
├── backend/          # Spring Boot Backend (Maven)
├── frontend/         # Angular Frontend
├── PROJECT_MAP.md    # Architecture documentation
├── README.md         # This file
└── .gitignore
```

## Quick Start

### 1. Start MongoDB

```bash
# Make sure MongoDB is running on localhost:27017
# Default: no authentication required
mongod
```

### 2. Run Backend

```bash
cd backend

# (Optional) Set JWT secret for production
export JWT_SECRET=$(openssl rand -hex 32)

# Build and run
mvn spring-boot:run

# The backend starts on http://localhost:8080
# H2 Console available at http://localhost:8080/h2-console
#   JDBC URL: jdbc:h2:mem:estore
#   Username: sa
#   Password: (leave empty)
```

> **JWT Secret**: For production, set the `JWT_SECRET` environment variable with a 64+ character hex string.
> Example: `export JWT_SECRET=$(openssl rand -hex 32)`
> **Note**: No default secret is provided - you MUST set this variable for the application to start.

### 3. Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# The frontend starts on http://localhost:4200
```

## Test Accounts

The backend initializes demo data automatically on startup:

| Email | Password | Role |
|---|---|---|
| admin@estore.com | admin123 | ADMIN |
| omar@test.com | user123 | USER |
| fatima@test.com | user123 | USER |

## Features

### Customer Domain
- User registration with email uniqueness validation
- JWT-based authentication (login/logout)
- Profile viewing and editing

### Catalog Domain
- Product listing with pagination
- Search by keyword
- Filter by category
- Product detail view

### Inventory Domain
- Stock tracking per product
- Stock validation before cart/order operations

### Shopping Domain
- Shopping cart management (add, update, remove items)
- Real-time cart total calculation
- Stock validation on cart operations

### Billing Domain
- Order placement from cart
- Stock decrement on order confirmation
- Cart clearing after order
- Order history with detail view

### Review Domain (MongoDB)
- Product reviews with ratings (1-5)
- Review listing per product
- Review creation by authenticated users

### Admin Domain
- Product CRUD operations
- Stock management
- **File upload**: Product video (MP4/WebM, max 50MB) + images (JPG/PNG/GIF/WebP, max 5MB each, 1-5 images)
- Drag & drop support with live previews in admin dialog

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login (returns JWT) |

### Products & Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List all products |
| GET | /api/products/{id} | Get product detail |
| GET | /api/products/search?keyword=&categoryId= | Search/filter |
| GET | /api/products/page?page=0&size=12 | Paginated products (with optional keyword/categoryId) |
| GET | /api/products/latest | Get latest 3 products (for video slider) |
| GET | /api/categories | List categories |

### Cart (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cart/{userId} | Get cart |
| POST | /api/cart/add?userId=&productId=&quantity= | Add to cart |
| PUT | /api/cart/update?userId=&itemId=&quantity= | Update quantity |
| DELETE | /api/cart/remove/{itemId}?userId= | Remove item |

### Orders (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/orders?userId= | Place order |
| GET | /api/orders/user/{userId} | Order history |
| GET | /api/orders/{id} | Order detail |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reviews/product/{productId}?page=0&size=10 | Get product reviews (paginated) |
| POST | /api/reviews | Create review (prevents duplicates) |

### Admin (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/admin/products | Create product (JSON body) |
| PUT | /api/admin/products/{id} | Update product |
| DELETE | /api/admin/products/{id} | Delete product |
| PUT | /api/admin/inventory/{productId}?quantity= | Update stock |
| POST | /api/admin/products/upload | Create product with video + images (multipart/form-data) |

#### File Upload Details
- **Video**: Single file, MP4/WebM/OGG format, max 50MB
- **Images**: 1-5 files, JPG/PNG/GIF/WebP format, max 5MB each
- **Storage**: Files saved to `uploads/videos/` and `uploads/images/`
- **Access**: Served statically at `/uploads/**` (e.g., `http://localhost:8080/uploads/videos/abc123.mp4`)
- The upload endpoint returns the created product with `videoPath` and `imagePaths` populated

## Architecture

### Backend (Spring Boot)
- **Layered Architecture**: Controller → Service → Repository
- **Domain-Driven**: customer, catalog, inventory, shopping, billing, review, admin
- **Data Persistence**:
  - JPA/H2 for relational data (users, products, orders, cart)
  - MongoDB for document data (product reviews)
- **Security**: JWT-based stateless authentication with Spring Security

### Frontend (Angular)
- **Feature-based structure**: auth, catalog, cart, orders, profile, admin, home
- **Core services**: API service, Auth service, JWT interceptor
- **UI**: Angular Material components
- **Routing**: Lazy-loaded feature modules with auth guards
- **Libraries**: Swiper.js for carousel/slider functionality
- **Features**:
  - Video slider on home page (autoplay, loop, muted)
  - Image gallery with thumbnails on product detail
  - File upload with drag & drop + live previews in admin
  - Scroll-driven animations (fade-up, scale-up, slide-left/right)
  - Responsive full-screen design with light/dark themes

## Configuration

### Backend (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:estore
  data:
    mongodb:
      uri: mongodb://localhost:27017/estore
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB

jwt:
  secret: ${JWT_SECRET:}
  expiration: 86400000  # 24 hours
```

> **Important**: You MUST set the `JWT_SECRET` environment variable before running in production. There is no default value.

### File Upload Storage
- Uploaded files are stored in the `uploads/` directory at the project root
- Structure:
  ```
  uploads/
  ├── images/    # Product images (JPG, PNG, GIF, WebP)
  └── videos/    # Product videos (MP4, WebM, OGG)
  ```
- Files are served statically via `/uploads/**` endpoint
- Add `uploads/` to `.gitignore` to prevent committing media files
- **Important**: The `uploads/` directory is created automatically on first backend startup

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Build for Production

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/estore-backend-1.0.0.jar

# Frontend
cd frontend
ng build --configuration production
# Output in dist/estore-frontend/
```

## Running Tests

```bash
cd backend
mvn test
```

### Test Coverage

| Service | Tests | Coverage |
|---|---|---|
| CatalogService | 11 | Search, pagination, CRUD |
| ShoppingService | 10 | Cart operations, totals |
| BillingService | 8 | Order placement, validation |
| **Total** | **29** | **All passing** |

Tests use JUnit 5 + Mockito. Key scenarios covered:
- **Search logic**: all filter combinations (keyword only, category only, both, none)
- **Pagination**: page size, total count, filtering
- **Cart**: add/update/remove items, stock validation, total calculation
- **Orders**: empty cart rejection, stock check, order creation, history

## New Dependencies

| Library | Version | Purpose |
|---|---|---|
| swiper | latest | Video/image carousel on home page |
