import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    @if (loading) {
      <div class="shop-loading">
        <div class="spinner"></div>
        <span>Loading products...</span>
      </div>
    } @else if (error) {
      <div class="shop-error">
        <span class="error-icon">!</span>
        <h2>Couldn't load products</h2>
        <p>Something went wrong. Please try again.</p>
        <button class="retry-btn" (click)="loadProducts()">Try Again</button>
      </div>
    } @else {
      <!-- Hero -->
      <section class="shop-hero">
        <div class="shop-hero-bg"></div>
        <div class="shop-hero-content">
          <h1 class="shop-hero-title">Shop All Products</h1>
          <p class="shop-hero-sub">Discover our curated collection of electronics, gadgets, and more</p>
        </div>
      </section>

      <div class="shop-container">
        <!-- Toolbar -->
        <div class="shop-toolbar">
          <span class="shop-count">{{ totalElements }} product{{ totalElements !== 1 ? 's' : '' }}</span>
          <div class="shop-sort">
            <label for="sort-select">Sort by</label>
            <select id="sort-select" class="sort-select" [value]="sortBy" (change)="onSortChange($event)">
              <option value="random">Random</option>
              <option value="price">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="createdAt">Newest First</option>
            </select>
          </div>
        </div>

        <!-- Grid -->
        @if (products.length > 0) {
          <div class="shop-grid">
            @for (product of products; track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        } @else {
          <div class="shop-empty">
            <p>No products match your criteria.</p>
          </div>
        }

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="shop-pagination">
            <button class="page-btn" [class.disabled]="page === 0" (click)="prevPage()" [disabled]="page === 0">
              Prev
            </button>
            @for (p of pageNumbers; track p) {
              <button class="page-btn" [class.active]="p === page" (click)="goToPage(p)">
                {{ p + 1 }}
              </button>
            }
            <button class="page-btn" [class.disabled]="last" (click)="nextPage()" [disabled]="last">
              Next
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .shop-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 120px 0;
      color: var(--text-tertiary);
      font-size: 14px;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-primary);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .shop-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 120px 0;
      text-align: center;
    }
    .error-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
    }
    .shop-error h2 {
      font-family: 'DM Sans', sans-serif;
      font-size: 20px;
      color: var(--text-primary);
      margin: 0;
    }
    .shop-error p {
      font-size: 14px;
      color: var(--text-tertiary);
      margin: 0;
    }
    .retry-btn {
      margin-top: 8px;
      padding: 10px 28px;
      border: 2px solid var(--accent-primary);
      border-radius: var(--radius-pill);
      background: var(--accent-primary);
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .retry-btn:hover {
      opacity: 0.85;
    }

    /* Hero */
    .shop-hero {
      position: relative;
      width: 100%;
      height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .shop-hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 50%, var(--bg-secondary) 100%);
      opacity: 0.6;
    }
    .shop-hero-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 30% 50%, var(--accent-primary) 0%, transparent 60%);
      opacity: 0.08;
    }
    .shop-hero-content {
      position: relative;
      text-align: center;
      z-index: 1;
    }
    .shop-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.1;
    }
    .shop-hero-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      color: var(--text-tertiary);
      margin: 16px 0 0;
      letter-spacing: 0.02em;
    }

    /* Container */
    .shop-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 64px;
    }

    /* Toolbar */
    .shop-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 0;
      border-bottom: 1px solid var(--border-primary);
      margin-bottom: 32px;
    }
    .shop-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-tertiary);
    }
    .shop-sort {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .shop-sort label {
      font-size: 13px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .sort-select {
      padding: 8px 32px 8px 14px;
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-pill);
      background: var(--bg-card);
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color 0.2s;
    }
    .sort-select:focus {
      outline: none;
      border-color: var(--accent-primary);
    }

    /* Grid */
    .shop-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    /* Empty */
    .shop-empty {
      text-align: center;
      padding: 80px 0;
      color: var(--text-tertiary);
      font-size: 15px;
    }

    /* Pagination */
    .shop-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 48px 0 0;
    }
    .page-btn {
      min-width: 40px;
      height: 40px;
      padding: 0 14px;
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-pill);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .page-btn:hover:not(.active):not(.disabled) {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .page-btn.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: #fff;
    }
    .page-btn.disabled, .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .shop-hero {
        height: 240px;
      }
      .shop-toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      .shop-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
      }
      .shop-container {
        padding: 0 16px 48px;
      }
      .shop-pagination {
        flex-wrap: wrap;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  loading = true;
  error = false;
  products: Product[] = [];
  page = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;
  last = false;
  sortBy = 'random';

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (cats) => {
        const categories = cats.data;
        this.api.getProducts().subscribe({
          next: (res) => {
            const allProducts = res.data;
            this.buildSections(categories, allProducts);
            this.startCarousels();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
          }
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      }
    });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.page - 2);
    const end = Math.min(this.totalPages - 1, this.page + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = false;

    if (this.sortBy === 'random') {
      this.api.getRandomProducts(this.page, this.pageSize).subscribe({
        next: (res) => {
          this.products = res.data.content;
          this.page = res.data.page;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.last = res.data.last;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
    } else {
      const [sortBy, sortDir] = this.sortBy === 'price-desc'
        ? ['price', 'desc']
        : this.sortBy === 'price'
          ? ['price', 'asc']
          : [this.sortBy, 'desc'];

      this.api.getProductsPaginated(this.page, this.pageSize, undefined, undefined, undefined, sortBy, sortDir).subscribe({
        next: (res) => {
          this.products = res.data.content;
          this.page = res.data.page;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.last = res.data.last;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
    }
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === this.sortBy) return;
    this.sortBy = value;
    this.page = 0;
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadProducts();
  }

  prevPage(): void {
    this.goToPage(this.page - 1);
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }
}
