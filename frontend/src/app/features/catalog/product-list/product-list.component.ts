import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category } from '../../../core/models';

interface CategorySection {
  category: Category;
  heroMedia: { type: 'video' | 'image'; src: string } | null;
  newArrivals: Product[];
  remaining: Product[];
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <!-- EDITORIAL HERO -->
    <section class="page-hero">
      <div class="hero-atmosphere">
        <div class="hero-orb hero-orb--warm"></div>
        <div class="hero-orb hero-orb--cool"></div>
      </div>
      <div class="hero-inner container reveal">
        <span class="hero-eyebrow">Discover Premium Tech</span>
        <h1 class="hero-heading">
          Next-Gen
          <span class="heading-accent">Electronics.</span>
        </h1>
        <p class="hero-body">
          Experience the pinnacle of hardware design. Crafted with precision,
          engineered for performance.
        </p>
      </div>
    </section>

    @if (loading) {
      <div class="container">
        <div class="skel-grid">
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
      </div>
    } @else {
      @for (section of sections; track section.category.id; let last = $last) {
        <section class="cat-section">

          <!-- Category heading -->
          <div class="container">
            <h2 class="cat-heading">{{ section.category.name }}</h2>
          </div>

          <!-- Hero banner -->
          @if (section.heroMedia) {
            @if (section.heroMedia.type === 'video') {
              <div class="cat-hero">
                <video [src]="section.heroMedia.src" autoplay loop muted [muted]="true" playsinline class="cat-hero-video"></video>
              </div>
            } @else {
              <div class="cat-hero">
                <img [src]="section.heroMedia.src" class="cat-hero-img">
              </div>
            }
          }

          <div class="container">

            <!-- New arrivals row -->
            @if (section.newArrivals.length > 0) {
              <div class="cat-new-row">
                @for (product of section.newArrivals; track product.id) {
                  <a [routerLink]="['/products', product.id]" class="cat-new-card">
                    <div class="cat-new-media">
                      @if (product.imagePaths && product.imagePaths.length >= 2) {
                        <div class="cat-new-duo">
                          <img [src]="product.imagePaths[0]" [alt]="product.name" class="cat-new-img">
                          <img [src]="product.imagePaths[1]" [alt]="product.name" class="cat-new-img">
                        </div>
                      } @else {
                        <img [src]="product.imageUrl" [alt]="product.name" class="cat-new-single">
                      }
                      <div class="cat-new-badge">New</div>
                    </div>
                    <div class="cat-new-info">
                      <h3 class="cat-new-name">{{ product.name }}</h3>
                      <span class="cat-new-price">\${{ product.price | number:'1.2-2' }}</span>
                    </div>
                  </a>
                }
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
    }
  `,
  styles: [`
    /* HERO */
    .page-hero {
      position: relative;
      min-height: 50vh;
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
    }

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
      padding: 48px 0 0;
    }

    .cat-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-bottom: 32px;
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

    /* New arrivals row */
    .cat-new-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .cat-new-card {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      transition: transform 0.3s ease, box-shadow 0.4s ease;
    }

    .cat-new-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-float);
    }

    .cat-new-media {
      position: relative;
      width: 100%;
      height: 320px;
      overflow: hidden;
      background: var(--bg-secondary);
    }

    .cat-new-duo {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .cat-new-img {
      width: 50%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .cat-new-card:hover .cat-new-img {
      transform: scale(1.1);
    }

    .cat-new-single {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .cat-new-card:hover .cat-new-single {
      transform: scale(1.1);
    }

    .cat-new-badge {
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

    .cat-new-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cat-new-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
    }

    .cat-new-price {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
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

    /* Responsive */
    @media (max-width: 768px) {
      .page-hero {
        min-height: 40vh;
        padding: 24px 0;
      }

      .hero-heading {
        font-size: 2.2rem;
      }

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
export class ProductListComponent implements OnInit {
  loading = true;
  sections: CategorySection[] = [];

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (cats) => {
        const categories = cats.data;
        this.api.getProducts().subscribe({
          next: (res) => {
            const allProducts = res.data;
            this.buildSections(categories, allProducts);
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

        const newArrivals = catProducts.slice(0, 3);
        const remaining = catProducts.slice(3);

        const heroProduct = catProducts.find(p => p.videoPath) || catProducts[0];
        let heroMedia: { type: 'video' | 'image'; src: string } | null = null;
        if (heroProduct?.videoPath) {
          heroMedia = { type: 'video', src: heroProduct.videoPath };
        } else if (heroProduct?.imageUrl) {
          heroMedia = { type: 'image', src: heroProduct.imageUrl };
        }

        return { category: cat, heroMedia, newArrivals, remaining };
      })
      .filter((s): s is CategorySection => s !== null);
  }
}
