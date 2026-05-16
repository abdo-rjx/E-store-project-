import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category } from '../../../core/models';
import { forkJoin } from 'rxjs';

interface CategoryHub {
  category: Category;
  featured: Product | null;
  rest: Product[];
  loading: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, MatSnackBarModule],
  template: `
    @if (loading) {
      <div class="shop-loading">
        <div class="spinner"></div>
        <span>Loading…</span>
      </div>
    } @else if (error) {
      <div class="shop-error">
        <span class="error-mark">!</span>
        <h2>Couldn't load products</h2>
        <button class="retry-btn" (click)="load()">Try Again</button>
      </div>
    } @else {

      <!-- ── HERO ── -->
      <section class="shop-hero">
        <div class="shop-hero-inner">
          <div class="shop-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Estoré — Browse by Category</span>
          </div>
          <h1 class="shop-title">Shop All<br>Electronics</h1>
        </div>
        <span class="shop-watermark" aria-hidden="true">SHOP</span>
      </section>

      <!-- ── CATEGORY HUBS ── -->
      @for (hub of hubs; track hub.category.id) {
        <section class="cat-section">

          <!-- section header -->
          <div class="cat-header">
            <div class="cat-header-left">
              <span class="cat-eyebrow">Category</span>
              <h2 class="cat-name">{{ hub.category.name }}</h2>
            </div>
            <a class="see-all-link"
               [routerLink]="['/categories', hub.category.name]">
              See All <span class="arrow">→</span>
            </a>
          </div>

          <!-- product row -->
          @if (hub.loading) {
            <div class="cat-skeleton">
              <div class="skeleton-featured"></div>
              @for (n of [1,2,3,4]; track n) {
                <div class="skeleton-card"></div>
              }
            </div>
          } @else if ((hub.featured || hub.rest.length) === null) {
            <p class="cat-empty">No products yet in this category.</p>
          } @else {
            <div class="cat-row">

              <!-- Featured slot -->
              @if (hub.featured) {
                <div class="featured-slot" (click)="goToProduct(hub.featured.id)">
                  <div class="featured-img-wrap">
                    <img [src]="hub.featured.imageUrl || hub.featured.imagePaths?.[0]"
                         [alt]="hub.featured.name"
                         class="featured-img"
                         onerror="this.src='https://placehold.co/480x360/1C1C1C/C8102E?text=E'">
                    @if (hub.featured.featured) {
                      <span class="featured-badge">★ Featured</span>
                    }
                  </div>
                  <div class="featured-info">
                    <p class="featured-cat">{{ hub.featured.categoryName }}</p>
                    <h3 class="featured-name">{{ hub.featured.name }}</h3>
                    <p class="featured-price">\${{ hub.featured.price | number:'1.2-2' }}</p>
                    <button class="featured-cta" (click)="$event.stopPropagation(); goToProduct(hub.featured.id)">
                      View Product
                    </button>
                  </div>
                </div>
              }

              <!-- Scrollable regular cards -->
              <div class="cards-scroll">
                @for (p of hub.rest; track p.id) {
                  <div class="scroll-card-wrap">
                    <app-product-card [product]="p"></app-product-card>
                  </div>
                }
                <!-- See-all end card -->
                <a class="see-all-card" [routerLink]="['/categories', hub.category.name]">
                  <span class="see-all-card-icon">→</span>
                  <span class="see-all-card-text">See All<br>{{ hub.category.name }}</span>
                </a>
              </div>

            </div>
          }

        </section>
      }

    }
  `,
  styles: [`
    /* ── Loading / error ── */
    .shop-loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px;
      min-height: 60vh;
      font-family: 'Outfit', sans-serif;
      color: var(--text-tertiary);
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .shop-error {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 80px 20px; text-align: center;
      font-family: 'Outfit', sans-serif;
    }
    .error-mark { font-size: 40px; color: var(--accent); }
    .retry-btn {
      margin-top: 8px;
      padding: 10px 24px;
      background: var(--accent); color: #fff;
      border: none; cursor: pointer;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
    }

    /* ── Hero ── */
    .shop-hero {
      position: relative;
      overflow: hidden;
      padding: 72px var(--page-gutter, 48px) 56px;
      border-bottom: 1px solid var(--border);
    }
    .shop-hero-inner { position: relative; z-index: 1; }
    .shop-eyebrow {
      display: flex; align-items: center; gap: 12px;
      font-family: 'Outfit', sans-serif;
      font-size: 11px; letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: 16px;
    }
    .eyebrow-rule {
      display: block; width: 32px; height: 1px;
      background: var(--accent);
    }
    .shop-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(3.5rem, 8vw, 7rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      line-height: 0.92;
      color: var(--text-primary);
    }
    .shop-watermark {
      position: absolute;
      right: -0.05em; bottom: -0.2em;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(8rem, 20vw, 16rem);
      font-weight: 800;
      text-transform: uppercase;
      color: transparent;
      -webkit-text-stroke: 1px var(--border);
      line-height: 1;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }

    /* ── Category section ── */
    .cat-section {
      padding: 56px var(--page-gutter, 48px) 0;
      border-bottom: 1px solid var(--border);
      padding-bottom: 56px;
    }
    .cat-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 28px;
    }
    .cat-header-left { display: flex; flex-direction: column; gap: 2px; }
    .cat-eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 10px; letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .cat-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(1.8rem, 3vw, 2.6rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      line-height: 1;
    }
    .see-all-link {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--text-tertiary);
      text-decoration: none;
      display: flex; align-items: center; gap: 6px;
      transition: color 0.15s;
      padding-bottom: 2px;
      border-bottom: 1px solid transparent;
    }
    .see-all-link:hover { color: var(--accent); border-bottom-color: var(--accent); }
    .arrow { transition: transform 0.15s; }
    .see-all-link:hover .arrow { transform: translateX(3px); }

    /* ── Product row ── */
    .cat-row {
      display: flex;
      gap: 1px;
      background: var(--border);
      overflow: hidden;
    }

    /* ── Featured slot ── */
    .featured-slot {
      flex-shrink: 0;
      width: 320px;
      display: flex;
      flex-direction: column;
      background: var(--bg-1);
      cursor: pointer;
      transition: background 0.2s;
    }
    .featured-slot:hover { background: var(--bg-2); }
    .featured-img-wrap {
      position: relative;
      aspect-ratio: 4/3;
      overflow: hidden;
      background: var(--bg-2);
    }
    .featured-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .featured-slot:hover .featured-img { transform: scale(1.04); }
    .featured-badge {
      position: absolute;
      top: 12px; left: 12px;
      padding: 4px 10px;
      background: var(--accent);
      color: #fff;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .featured-info {
      padding: 20px;
      display: flex; flex-direction: column; gap: 6px;
      flex: 1;
    }
    .featured-cat {
      font-family: 'Outfit', sans-serif;
      font-size: 10px; letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .featured-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.25rem; font-weight: 700;
      text-transform: uppercase;
      color: var(--text-primary);
      line-height: 1.1;
    }
    .featured-price {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.4rem; font-weight: 800;
      color: var(--accent);
    }
    .featured-cta {
      margin-top: auto;
      padding: 10px 0;
      background: var(--accent); color: #fff;
      border: none; cursor: pointer;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      transition: background 0.15s;
    }
    .featured-cta:hover { background: var(--accent-hover, #a00c24); }

    /* ── Scrollable cards ── */
    .cards-scroll {
      display: flex;
      gap: 1px;
      overflow-x: auto;
      flex: 1;
      background: var(--border);
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .cards-scroll::-webkit-scrollbar { height: 4px; }
    .cards-scroll::-webkit-scrollbar-track { background: transparent; }
    .cards-scroll::-webkit-scrollbar-thumb { background: var(--border); }
    .scroll-card-wrap {
      flex-shrink: 0;
      width: 220px;
      background: var(--bg-1);
    }
    .scroll-card-wrap ::ng-deep app-product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* ── See-all end card ── */
    .see-all-card {
      flex-shrink: 0;
      width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: var(--bg-1);
      text-decoration: none;
      transition: background 0.15s;
    }
    .see-all-card:hover { background: var(--bg-2); }
    .see-all-card-icon {
      font-size: 2rem;
      color: var(--accent);
      line-height: 1;
      transition: transform 0.15s;
    }
    .see-all-card:hover .see-all-card-icon { transform: translateX(4px); }
    .see-all-card-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      text-align: center; line-height: 1.3;
      color: var(--text-secondary);
    }

    /* ── Skeletons ── */
    .cat-skeleton {
      display: flex; gap: 1px;
      background: var(--border);
      overflow: hidden;
    }
    .skeleton-featured {
      flex-shrink: 0; width: 320px; height: 300px;
      background: var(--bg-2);
      animation: pulse 1.5s ease-in-out infinite;
    }
    .skeleton-card {
      flex-shrink: 0; width: 220px; height: 300px;
      background: var(--bg-2);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .cat-empty {
      font-family: 'Outfit', sans-serif;
      font-size: 14px; color: var(--text-tertiary);
      padding: 32px 0;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .shop-hero { padding: 48px 20px 40px; }
      .cat-section { padding: 40px 20px; }
      .featured-slot { width: 260px; }
      .scroll-card-wrap { width: 180px; }
    }
    @media (max-width: 480px) {
      .cat-row { flex-direction: column; background: none; }
      .featured-slot { width: 100%; }
      .cards-scroll { width: 100%; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  hubs: CategoryHub[] = [];
  loading = true;
  error = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;

    this.api.getCategories().subscribe({
      next: res => {
        const categories = (res.data || []).filter(c => c.parentId == null);
        this.hubs = categories.map(cat => ({
          category: cat,
          featured: null,
          rest: [],
          loading: true
        }));
        this.loading = false;
        this.loadCategoryProducts();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  private loadCategoryProducts(): void {
    for (const hub of this.hubs) {
      this.api.getProductsByCategory(hub.category.id, 7).subscribe({
        next: res => {
          const products = res.data?.content || [];
          if (products.length === 0) {
            hub.featured = null;
            hub.rest = [];
          } else {
            const featuredIdx = products.findIndex(p => p.featured);
            if (featuredIdx >= 0) {
              hub.featured = products[featuredIdx];
              hub.rest = products.filter((_, i) => i !== featuredIdx);
            } else {
              hub.featured = products[0];
              hub.rest = products.slice(1);
            }
          }
          hub.loading = false;
        },
        error: () => {
          hub.loading = false;
        }
      });
    }
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }
}
