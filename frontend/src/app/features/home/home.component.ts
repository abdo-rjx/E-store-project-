import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StickySectionComponent } from '../../shared/components/sticky-section/sticky-section.component';
import { ProductShowcaseComponent } from '../../shared/components/product-showcase/product-showcase.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    StickySectionComponent,
    ProductShowcaseComponent,
    ScrollRevealDirective,
  ],
  template: `
    <!-- CINEMATIC VIDEO SLIDER -->
    <section class="cinema-slider">
      <div class="slider-frames" [class.active]="sliderLoaded">
        @for (product of latestProducts; track product.id; let i = $index) {
          <article class="slide-frame" [class.is-active]="i === activeSlide"
                   [attr.aria-hidden]="i !== activeSlide">
            @if (product.videoPath) {
              <video
                [src]="product.videoPath"
                muted
                loop
                [autoplay]="i === activeSlide"
                [playsInline]="true"
                class="frame-video"
                #slideVideos
              ></video>
            } @else {
              <img [src]="product.imagePaths?.[0] || product.imageUrl" [alt]="product.name" class="frame-image">
            }
            <div class="frame-vignette"></div>
            <div class="frame-grain"></div>
            <div class="frame-content">
              <span class="frame-label">N° {{ i + 1 }} — New Arrival</span>
              <h2 class="frame-heading">{{ product.name }}</h2>
              <p class="frame-excerpt">{{ product.description }}</p>
              <div class="frame-actions">
                <button class="btn-cinema" (click)="goToProduct(product.id)">
                  <span class="btn-cinema-label">Discover</span>
                  <span class="btn-cinema-arrow">
                    <span class="material-icons">arrow_forward</span>
                  </span>
                </button>
                <span class="frame-price">\${{ product.price | number:'1.2-2' }}</span>
              </div>
            </div>
          </article>
        }
      </div>

      @if (latestProducts.length > 1) {
        <nav class="slider-nav" aria-label="Slide navigation">
          <button class="nav-chevron nav-chevron--prev" (click)="prevSlide()" aria-label="Previous slide">
            <span class="material-icons">chevron_left</span>
          </button>
          <div class="nav-progress">
            @for (p of latestProducts; track p.id; let i = $index) {
              <button class="nav-dot" [class.is-current]="i === activeSlide" (click)="goToSlide(i)" [attr.aria-label]="'Go to slide ' + (i + 1)">
                <span class="nav-dot-fill"></span>
              </button>
            }
          </div>
          <button class="nav-chevron nav-chevron--next" (click)="nextSlide()" aria-label="Next slide">
            <span class="material-icons">chevron_right</span>
          </button>
        </nav>
      }
    </section>

    <!-- FEATURED PRODUCTS -->
    <app-product-showcase
      [products]="featuredProducts"
      appScrollReveal="scale-up"
    ></app-product-showcase>

    <!-- WHY CHOOSE US -->
    <app-sticky-section
      label="WHY CHOOSE US"
      title="An Experience, Not Just a Store"
      description="Free shipping on all orders, 24/7 dedicated support, and a 30-day hassle-free return policy. Your satisfaction is our priority."
      gradient="linear-gradient(135deg, #1a1a2e 0%, #533483 100%)"
      layout="right"
      appScrollReveal="fade-up"
    >
      <div content class="perks-list">
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.1">
          <span class="material-icons perk-icon">local_shipping</span>
          <div class="perk-body">
            <h4>Free Express Shipping</h4>
            <p>On all orders, no minimum required</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.2">
          <span class="material-icons perk-icon">support_agent</span>
          <div class="perk-body">
            <h4>24/7 Expert Support</h4>
            <p>Real people, real solutions</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.3">
          <span class="material-icons perk-icon">replay</span>
          <div class="perk-body">
            <h4>30-Day Returns</h4>
            <p>No questions asked, full refund</p>
          </div>
        </div>
      </div>
    </app-sticky-section>

    <!-- CTA -->
    <section class="editorial-cta" appScrollReveal="fade-up">
      <div class="cta-grain"></div>
      <div class="cta-content">
        <span class="cta-label">Ready to Upgrade?</span>
        <h2>Join thousands of satisfied customers who trust us for their tech needs.</h2>
        <button class="btn-cinema btn-cinema--light" (click)="goToProducts()">
          <span class="btn-cinema-label">Browse Full Catalog</span>
          <span class="btn-cinema-arrow">
            <span class="material-icons">arrow_forward</span>
          </span>
        </button>
      </div>
    </section>
  `,
  styles: [`
    /* ---- CINEMA SLIDER ---- */
    .cinema-slider {
      position: relative;
      height: 92vh;
      min-height: 560px;
      overflow: hidden;
      background: #050505;
    }

    .slider-frames {
      position: relative;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.8s ease;
    }

    .slider-frames.active { opacity: 1; }

    .slide-frame {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
    }

    .slide-frame.is-active { opacity: 1; }

    .frame-video, .frame-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.03);
      transition: transform 8s ease;
    }

    .slide-frame.is-active .frame-video,
    .slide-frame.is-active .frame-image {
      transform: scale(1);
    }

    .frame-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(5, 5, 5, 0.85) 0%,
        rgba(5, 5, 5, 0.4) 45%,
        rgba(5, 5, 5, 0.1) 100%
      );
    }

    .frame-grain {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .frame-content {
      position: relative;
      z-index: 2;
      max-width: 620px;
      padding: 0 5rem;
      transform: translateY(24px);
      opacity: 0;
      transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.4s;
    }

    .slide-frame.is-active .frame-content {
      transform: translateY(0);
      opacity: 1;
    }

    .frame-label {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(234, 156, 72, 0.12);
      border: 1px solid rgba(234, 156, 72, 0.3);
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      margin-bottom: 20px;
      font-family: 'DM Sans', sans-serif;
    }

    .frame-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.2rem, 5.5vw, 4rem);
      font-weight: 700;
      color: #fff;
      line-height: 1.08;
      letter-spacing: -0.02em;
      margin-bottom: 18px;
    }

    .frame-excerpt {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.7;
      margin-bottom: 36px;
      max-width: 500px;
    }

    .frame-actions {
      display: flex;
      align-items: center;
      gap: 28px;
      flex-wrap: wrap;
    }

    .btn-cinema {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 36px;
      border-radius: var(--radius-pill);
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: 'DM Sans', sans-serif;
      background: var(--accent-gradient);
      color: #fff;
      box-shadow: 0 4px 24px var(--accent-primary-glow);
    }

    .btn-cinema--light {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      box-shadow: none;
    }

    .btn-cinema:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-cinema--light:hover {
      border-color: var(--accent-primary);
      background: var(--accent-primary-glow);
      box-shadow: 0 4px 20px var(--accent-primary-glow);
    }

    .btn-cinema-arrow .material-icons {
      font-size: 18px;
      transition: transform 0.3s;
    }

    .btn-cinema:hover .btn-cinema-arrow .material-icons {
      transform: translateX(4px);
    }

    .frame-price {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #fff;
    }

    /* SLIDER NAV */
    .slider-nav {
      position: absolute;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 10;
    }

    .nav-chevron {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-chevron:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: scale(1.08);
    }

    .nav-progress {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .nav-dot {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .nav-dot.is-current {
      width: 48px;
      background: var(--accent-primary);
    }

    .nav-dot-fill {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* PERKS */
    .perks-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .perk-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: var(--radius-md);
      transition: background 0.3s ease;
    }

    .perk-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .perk-icon {
      font-size: 26px;
      color: var(--accent-primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .perk-body h4 {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 0.3rem;
    }

    .perk-body p {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    /* EDITORIAL CTA */
    .editorial-cta {
      position: relative;
      text-align: center;
      padding: 10rem 2rem 8rem;
      overflow: hidden;
    }

    .cta-grain {
      position: absolute;
      inset: 0;
      opacity: 0.02;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .cta-content {
      position: relative;
      z-index: 1;
    }

    .cta-label {
      font-family: 'Playfair Display', serif;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      text-transform: uppercase;
      display: block;
      margin-bottom: 16px;
    }

    .editorial-cta h2 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 2.5rem;
      max-width: 640px;
      margin-left: auto;
      margin-right: auto;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .cinema-slider {
        height: 72vh;
        min-height: 460px;
      }

      .frame-content {
        padding: 0 2rem;
        max-width: 100%;
      }

      .frame-heading {
        font-size: 2rem;
      }

      .frame-excerpt {
        font-size: 0.9rem;
      }

      .frame-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
      }

      .slider-nav {
        bottom: 1.5rem;
        gap: 12px;
      }

      .nav-chevron {
        width: 36px;
        height: 36px;
      }

      .editorial-cta {
        padding: 6rem 1.5rem 5rem;
      }

      .editorial-cta h2 {
        font-size: 1.8rem;
      }
    }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  latestProducts: Product[] = [];
  activeSlide = 0;
  sliderLoaded = false;
  private autoSlideTimer: any;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLatestProducts();
    this.api.getProductsPaginated(0, 6).subscribe({
      next: (res) => {
        this.featuredProducts = res.data.content;
      },
      error: () => this.snackBar.open('Failed to load products', 'Close', { duration: 3000 }),
    });
  }

  private loadLatestProducts(): void {
    this.api.getLatestProducts().subscribe({
      next: (res) => {
        this.latestProducts = res.data;
        this.sliderLoaded = true;
        this.playActiveVideo();
        this.startAutoSlide();
      },
      error: () => {
        this.sliderLoaded = true;
      }
    });
  }

  private startAutoSlide(): void {
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide(): void {
    this.pauseAllVideos();
    this.activeSlide = (this.activeSlide + 1) % this.latestProducts.length;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  prevSlide(): void {
    this.pauseAllVideos();
    this.activeSlide = (this.activeSlide - 1 + this.latestProducts.length) % this.latestProducts.length;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  goToSlide(index: number): void {
    this.pauseAllVideos();
    this.activeSlide = index;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  private playActiveVideo(): void {
    setTimeout(() => {
      const videos = document.querySelectorAll('.frame-video');
      videos.forEach((video, i) => {
        const v = video as HTMLVideoElement;
        if (i === this.activeSlide) {
          v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, 300);
  }

  private pauseAllVideos(): void {
    const videos = document.querySelectorAll('.frame-video');
    videos.forEach(video => {
      (video as HTMLVideoElement).pause();
    });
  }

  private resetAutoSlide(): void {
    clearInterval(this.autoSlideTimer);
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideTimer);
    this.pauseAllVideos();
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }
}
