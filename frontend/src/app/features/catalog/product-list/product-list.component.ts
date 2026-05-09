import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category } from '../../../core/models';

interface CategorySection {
  category: Category;
  heroMedia: { type: 'video' | 'image'; src: string } | null;
  newArrivals: Product[];
  remaining: Product[];
  carouselAnimating: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    @if (sections.length > 0) {
      @for (section of sections; track section.category.id; let last = $last) {
        <section class="cat-section">

          <!-- Category heading -->
          <div class="cat-heading-wrap">
            <h2 class="cat-heading">{{ section.category.name }}</h2>
          </div>

          <!-- Hero banner -->
          @if (section.heroMedia && section.heroMedia.src && !failedVideos.has(section.heroMedia.src)) {
            @if (section.heroMedia.type === 'video') {
              <div class="cat-hero">
                <video [src]="section.heroMedia.src" autoplay loop muted [muted]="true" playsinline class="cat-hero-video"
                       (error)="failedVideos.add(section.heroMedia.src)"></video>
              </div>
            } @else {
              <div class="cat-hero">
                <img [src]="section.heroMedia.src" class="cat-hero-img">
              </div>
            }
          }

          <div class="container">

            <!-- New arrivals carousel -->
            @if (section.newArrivals.length > 0) {
              <div class="carousel-outer">
                <div class="carousel-inner"
                     [style.transform]="section.carouselAnimating ? 'translateX(-450px)' : 'translateX(0)'"
                     [style.transition]="section.carouselAnimating ? 'transform 0.5s ease-in-out' : 'none'">
                  @for (product of section.newArrivals; track product.id) {
                    <div class="carousel-card" (click)="goToProduct(product.id)">
                      <div class="carousel-card-media">
                        @if (product.imagePaths && product.imagePaths.length >= 2) {
                          <div class="carousel-card-duo">
                            <img [src]="product.imagePaths[0]" [alt]="product.name" class="carousel-card-img">
                            <img [src]="product.imagePaths[1]" [alt]="product.name" class="carousel-card-img">
                          </div>
                        } @else {
                          <img [src]="product.imageUrl" [alt]="product.name" class="carousel-card-single">
                        }
                        <div class="carousel-card-badge">New</div>
                      </div>
                      <div class="carousel-card-info">
                        <span class="carousel-card-name">{{ product.name }}</span>
                        <span class="carousel-card-price">\${{ product.price | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div class="show-more-wrap">
                <button class="show-more-btn" (click)="goToCategoryPage(section.category.name)">
                  Show More
                  <span class="material-icons">arrow_forward</span>
                </button>
              </div>
            }

            <!-- Regular grid -->
            @if (section.remaining.length > 0) {
              <div class="cat-grid">
                @for (product of section.remaining; track product.id) {
                  <app-product-card [product]="product"></app-product-card>
                }
              </div>
            }

          </div>
        </section>

        @if (!last) {
          <div class="cat-sep"></div>
        }
      }
    } @else {
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>Loading products...</span>
      </div>
    }
  `,
  styles: [`
    /* Skeleton */
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      padding: 48px 0;
    }

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

    /* Category section */
    .cat-section {
      padding: 0;
    }

    .cat-heading-wrap {
      padding: 24px 0;
      text-align: center;
      width: 100%;
    }

    .cat-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--accent-primary);
      margin: 0;
      line-height: 1.1;
    }

    /* Hero banner */
    .cat-hero {
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      height: 450px;
      overflow: hidden;
      background: var(--bg-secondary);
      margin-bottom: 48px;
    }

    .cat-hero-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    .cat-hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* New arrivals carousel */
    .carousel-outer {
      overflow: hidden;
      width: 1350px;
      max-width: 100%;
      margin: 0 auto 0;
    }

    .carousel-inner {
      display: flex;
      width: fit-content;
      gap: 16px;
    }

    .carousel-card {
      width: 450px;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      cursor: pointer;
      transition: box-shadow 0.3s ease;
    }

    .carousel-card:hover {
      box-shadow: var(--shadow-float);
    }

    .carousel-card-media {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: var(--bg-secondary);
    }

    .carousel-card-duo {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .carousel-card-img {
      width: 50%;
      height: 100%;
      object-fit: contain;
    }

    .carousel-card-single {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .carousel-card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 14px;
      border-radius: var(--radius-pill);
      background: var(--accent-gradient);
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .carousel-card-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .carousel-card-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .carousel-card-price {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--accent-primary);
      letter-spacing: -0.01em;
    }

    .show-more-wrap {
      text-align: center;
      padding: 20px 0 48px;
    }

    .show-more-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 28px;
      border: 2px solid var(--accent-primary);
      border-radius: var(--radius-pill);
      background: transparent;
      color: var(--accent-primary);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .show-more-btn:hover {
      background: var(--accent-primary);
      color: #fff;
    }

    .show-more-btn .material-icons {
      font-size: 18px;
    }

    /* Regular grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      padding-bottom: 48px;
    }

    /* Separator */
    .cat-sep {
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      height: 1px;
      background: var(--border-primary);
    }

    /* Loading spinner */
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px 0;
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

    /* Responsive */
    @media (max-width: 768px) {
      .cat-hero {
        height: 300px;
      }

      .cat-new-row {
        grid-template-columns: 1fr;
      }

      .cat-new-media {
        height: 240px;
      }

      .cat-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  loading = true;
  sections: CategorySection[] = [];
  failedVideos = new Set<string>();
  private carouselTimers = new Map<number, ReturnType<typeof setInterval>>();

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    for (const timer of this.carouselTimers.values()) {
      clearInterval(timer);
    }
    this.carouselTimers.clear();
  }

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

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  goToCategoryPage(categoryName: string): void {
    this.router.navigate(['/shop/category', categoryName]);
  }

  private startCarousels(): void {
    for (const section of this.sections) {
      const id = section.category.id;
      this.carouselTimers.set(id, setInterval(() => {
        this.tickCarousel(section);
      }, 6000));
    }
  }

  private tickCarousel(section: CategorySection): void {
    section.carouselAnimating = true;
    setTimeout(() => {
      const items = [...section.newArrivals];
      const first = items.shift()!;
      items.push(first);
      section.newArrivals = items;
      section.carouselAnimating = false;
    }, 500);
  }

  private buildSections(categories: Category[], products: Product[]): void {
    const grouped = new Map<number, Product[]>();
    for (const p of products) {
      const list = grouped.get(p.categoryId) || [];
      list.push(p);
      grouped.set(p.categoryId, list);
    }
    for (const [, list] of grouped) {
      list.sort((a, b) => b.id - a.id);
    }

    this.sections = categories
      .map(cat => {
        const catProducts = grouped.get(cat.id) || [];
        if (catProducts.length === 0) return null;

        const topProducts = catProducts.slice(0, 5);
        const carouselItems = topProducts.length < 5
          ? Array.from({ length: 5 }, (_, i) => topProducts[i % topProducts.length])
          : [...topProducts];
        const remaining = catProducts.slice(5);

        const heroProduct = catProducts.find(p => p.videoPath) || catProducts[0];
        let heroMedia: { type: 'video' | 'image'; src: string } | null = null;
        if (heroProduct?.videoPath) {
          heroMedia = { type: 'video', src: heroProduct.videoPath };
        } else if (heroProduct?.imageUrl) {
          heroMedia = { type: 'image', src: heroProduct.imageUrl };
        }

        return { category: cat, heroMedia, newArrivals: carouselItems, remaining, carouselAnimating: false };
      })
      .filter((s): s is CategorySection => s !== null);
  }
}
