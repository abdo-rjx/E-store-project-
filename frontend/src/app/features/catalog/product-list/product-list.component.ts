import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, PageResponse } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, ProductCardComponent],
  template: `
    <!-- EDITORIAL HERO -->
    <section class="page-hero">
      <div class="hero-atmosphere">
        <div class="hero-orb hero-orb--warm"></div>
        <div class="hero-orb hero-orb--cool"></div>
      </div>
      <div class="hero-inner reveal">
        <span class="hero-eyebrow">Discover Premium Tech</span>
        <h1 class="hero-heading">
          Next-Gen
          <span class="heading-accent">Electronics.</span>
        </h1>
        <p class="hero-body">
          Experience the pinnacle of hardware design. Crafted with precision,
          engineered for performance.
        </p>
        <div class="hero-cta">
          <a href="#catalog" class="btn-primary-lg">
            Browse Catalog
            <span class="material-icons">arrow_downward</span>
          </a>
          <button class="btn-secondary-lg" (click)="scrollToSearch()">
            <span class="material-icons">search</span>
            Search
          </button>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-val">500+</span>
            <span class="stat-tag">Products</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-val">24/7</span>
            <span class="stat-tag">Support</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-val">Free</span>
            <span class="stat-tag">Shipping</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CATALOG -->
    <section id="catalog" class="catalog">
      <!-- Filters -->
      <div class="filter-bar reveal" #searchArea>
        <div class="filter-search">
          <span class="material-icons">search</span>
          <input type="text" class="es-input"
                 [(ngModel)]="searchTerm"
                 (ngModelChange)="onSearch()"
                 placeholder="Search products...">
        </div>
        <div class="filter-chips">
          <button class="chip" [class.is-active]="selectedCategory === null"
                  (click)="selectedCategory = null; onSearch()">
            All
          </button>
          @for (cat of categories; track cat.id) {
            <button class="chip" [class.is-active]="selectedCategory === cat.id"
                    (click)="selectedCategory = cat.id; onSearch()">
              {{ cat.name }}
            </button>
          }
        </div>
      </div>

      <!-- Grid -->
      @if (loading) {
        <div class="grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="ghost-card">
              <div class="ghost ghost-img"></div>
              <div class="ghost-body">
                <div class="ghost ghost-sm"></div>
                <div class="ghost ghost-md"></div>
                <div class="ghost ghost-lg"></div>
              </div>
            </div>
          }
        </div>
      } @else if (products.length === 0) {
        <div class="empty reveal">
          <span class="material-icons empty-icon">inventory_2</span>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      } @else {
        <div class="grid">
          @for (product of products; track product.id; let i = $index) {
            <div class="reveal" [style.transition-delay]="(i % 6) * 80 + 'ms'" #productCards>
              <app-product-card [product]="product"></app-product-card>
            </div>
          }
        </div>

        @if (pageResponse) {
          <mat-paginator
            [length]="pageResponse.totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24]"
            [pageIndex]="currentPage"
            (page)="onPageChange($event)"
            class="pager">
          </mat-paginator>
        }
      }
    </section>
  `,
  styles: [`
    /* HERO */
    .page-hero {
      position: relative;
      min-height: 68vh;
      display: flex;
      align-items: center;
      padding: 48px 0;
      overflow: hidden;
    }

    .hero-atmosphere {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .hero-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(140px);
    }

    .hero-orb--warm {
      width: 520px;
      height: 520px;
      background: var(--accent-primary);
      top: -120px;
      right: -80px;
      opacity: 0.1;
    }

    .hero-orb--cool {
      width: 380px;
      height: 380px;
      background: var(--accent-coral);
      bottom: -60px;
      left: -100px;
      opacity: 0.07;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      max-width: 660px;
    }

    .hero-eyebrow {
      display: inline-block;
      padding: 5px 14px;
      background: var(--accent-primary-glow);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      margin-bottom: 20px;
      text-transform: uppercase;
    }

    .hero-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 7vw, 4.2rem);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 20px;
      color: var(--text-primary);
    }

    .heading-accent {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-body {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.75;
      max-width: 500px;
      margin-bottom: 36px;
    }

    .hero-cta {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 52px;
    }

    .btn-primary-lg {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .btn-primary-lg:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-primary-lg .material-icons { font-size: 18px; }

    .btn-secondary-lg {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary-lg:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: var(--accent-primary-glow);
    }

    .btn-secondary-lg .material-icons { font-size: 18px; }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-val {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .stat-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-sep {
      width: 1px;
      height: 36px;
      background: var(--border-secondary);
    }

    /* CATALOG */
    .catalog {
      padding: 48px 0 24px;
    }

    /* Filter bar */
    .filter-bar {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 36px;
    }

    .filter-search {
      position: relative;
      max-width: 460px;
    }

    .filter-search .material-icons {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      font-size: 20px;
      z-index: 1;
    }

    .filter-search .es-input {
      padding-left: 48px !important;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      padding: 8px 20px;
      border-radius: var(--radius-pill);
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .chip:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }

    .chip.is-active {
      background: var(--accent-gradient);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 2px 12px var(--accent-primary-glow);
    }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    /* Skeleton */
    .ghost-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .ghost-img {
      width: 100%;
      aspect-ratio: 4 / 3;
    }

    .ghost-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ghost-sm { height: 12px; width: 30%; }
    .ghost-md { height: 18px; width: 70%; }
    .ghost-lg { height: 14px; width: 50%; }

    /* Empty */
    .empty {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      font-size: 60px;
      color: var(--text-tertiary);
      margin-bottom: 16px;
    }

    .empty h3 {
      margin-bottom: 8px;
      font-family: 'DM Sans', sans-serif;
    }

    .empty p {
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
    }

    /* Pager */
    .pager {
      margin-top: 40px;
      background: transparent !important;
      border-radius: var(--radius-md);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-hero {
        min-height: 50vh;
        padding: 24px 0;
      }

      .hero-heading {
        font-size: 2.2rem;
      }

      .hero-stats {
        gap: 16px;
      }

      .stat-val {
        font-size: 1.2rem;
      }

      .grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory: number | null = null;
  loading = true;

  pageResponse: PageResponse<Product> | null = null;
  currentPage = 0;
  pageSize = 12;

  @ViewChildren('productCards') productCards!: QueryList<ElementRef>;

  private observer!: IntersectionObserver;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.setupScrollReveal();
  }

  ngAfterViewInit(): void {
    this.productCards.changes.subscribe(() => this.observeCards());
    setTimeout(() => this.observeCards(), 100);
  }

  private setupScrollReveal(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        this.observer.observe(el);
      });
    }, 50);
  }

  private observeCards(): void {
    this.productCards?.forEach(card => {
      const el = card.nativeElement;
      this.observer.observe(el);
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => { this.categories = res.data; },
      error: () => this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 })
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProductsPaginated(this.currentPage, this.pageSize, this.searchTerm || undefined, this.selectedCategory || undefined).subscribe({
      next: (res) => {
        this.pageResponse = res.data;
        this.products = res.data.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  scrollToSearch(): void {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  }
}
