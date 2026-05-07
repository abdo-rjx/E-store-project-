# Changelog

All notable changes to the E-Store project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-05-07

### 🔴 Fixed (Critical Security & Functional Fixes)

- **Fixed duplicate review bug**: Added `existsByProductIdAndUserId` to `ReviewRepository` and validation in `ReviewService.createReview()` to prevent users from submitting multiple reviews for the same product
- **Added Admin Role Guard**: Created `AdminGuard` in frontend to properly restrict `/admin` routes to users with `ADMIN` role (previously only backend had protection)
- **Fixed JWT Secret exposure**: Removed default hardcoded JWT secret from `application.yml`. Now requires `JWT_SECRET` environment variable (no fallback default)
- **Fixed CORS configuration**: Changed from `setAllowedOrigins` to `setAllowedOriginPatterns` to support dynamic ports (e.g., `http://localhost:*`)

### 🟡 Changed (Medium Priority Fixes & Improvements)

- **Added pagination to reviews API**: Updated `ReviewController` and `ReviewService` to support `Pageable` parameter for `GET /api/reviews/product/{id}`
- **Improved transaction rollback**: Updated `BillingService.placeOrder()` with `@Transactional(rollbackFor = Exception.class)` for better error handling
- **Updated README.md**: Fixed admin password from `user123` to `admin123` (matching `DataInitializer`)
- **Updated API documentation**: Added pagination parameters to reviews endpoint documentation

### 🟢 Fixed (Low Priority / UI Improvements)

- **Improved theme toggling**: Added forced reflow in `ThemeService.applyTheme()` to ensure CSS variables update correctly
- **Enhanced responsive design**: Updated CSS media queries for better mobile experience (480px breakpoint)
- **Improved error handling**: Better error messages in `AdminComponent` file upload dialog

### 🔧 Added

- **AdminGuard**: New Angular guard for admin route protection
- **Pagination support**: For product reviews endpoint

### 🗑️ Removed

- **Default JWT secret**: No longer present in `application.yml` (security improvement)

## [1.0.0] - 2026-05-07

### Added

- Initial project structure with Domain-Driven Design (6 domains: customer, catalog, inventory, shopping, billing, review)
- JWT-based authentication with Spring Security
- Product catalog with search, filter, and pagination
- Shopping cart management
- Order placement with inventory validation
- Product reviews with MongoDB
- Admin panel for product CRUD with file upload (video + images)
- Angular 19 frontend with standalone components
- Lazy-loaded routes with auth guards
- Light/dark theme toggle with localStorage persistence
- Swiper.js video slider on homepage
- Scroll animations (fade-up, scale-up)
- Responsive design with CSS Grid
- 29 unit tests (CatalogService, ShoppingService, BillingService)
- H2 in-memory database for development
- File upload with drag & drop support
- CORS configuration for `http://localhost:4200`

---

**Legend:**
- 🔴 Critical fix
- 🟡 Medium priority change
- 🟢 Low priority / UI improvement
- 🔧 New feature
- 🗑️ Removal
