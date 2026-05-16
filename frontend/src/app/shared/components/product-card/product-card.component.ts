import { Component, Input, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/products', product.id]" class="card-link">
      <article class="product-card"
               (click)="onCardClick()"
               (mouseenter)="onEnter()"
               (mouseleave)="onLeave()"
               (mousemove)="onMove($event)">

        <!-- Media -->
        <div class="card-media">
          @if (product.imagePaths && product.imagePaths.length >= 2) {
            <div class="card-img-duo">
              <img [src]="product.imagePaths[0]" [alt]="product.name" class="card-img-duo-item"
                   onerror="this.src='https://placehold.co/400x300/141414/C8102E?text=ESTORÉ'">
              <img [src]="product.imagePaths[1]" [alt]="product.name" class="card-img-duo-item"
                   onerror="this.src='https://placehold.co/400x300/141414/C8102E?text=ESTORÉ'">
            </div>
          } @else {
            <img [src]="product.imageUrl" [alt]="product.name" class="card-img"
                 onerror="this.src='https://placehold.co/400x300/141414/C8102E?text=ESTORÉ'">
          }

          <!-- Shimmer on hover -->
          <div class="card-holo"></div>

          <!-- Badges -->
          @if (product.videoPath) {
            <div class="card-badge video-badge">
              <span class="material-icons">play_circle</span>
            </div>
          }

          @if (product.stock === 0) {
            <div class="card-badge stock-badge stock-badge--out">Sold Out</div>
          } @else if (product.stock <= 5) {
            <div class="card-badge stock-badge stock-badge--low">{{ product.stock }} left</div>
          }

          <!-- Hover overlay -->
          <div class="card-overlay">
            <div class="overlay-cta">
              <span class="material-icons">visibility</span>
              View Details
            </div>
          </div>

          <!-- Accent bar on hover -->
          <div class="card-accent-bar"></div>
        </div>

        <!-- Meta -->
        <div class="card-meta">
          <span class="card-cat">{{ product.categoryName }}</span>
          <h3 class="card-name">{{ product.name }}</h3>
          <div class="card-row">
            <span class="card-price">\${{ product.price | number:'1.2-2' }}</span>
            <span class="card-arrow">
              <span class="material-icons">arrow_forward</span>
            </span>
          </div>
        </div>

      </article>
    </a>
  `,
  styles: [`
    .card-link {
      text-decoration: none;
      color: inherit;
      display: block;
      height: 100%;
    }

    .product-card {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      will-change: transform;
      transform-style: preserve-3d;
      transition: transform 0.12s ease-out, box-shadow 0.35s ease, border-color 0.25s ease;
      cursor: pointer;
      overflow: hidden;
    }

    .product-card:hover {
      border-color: var(--border-bright);
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    }

    /* ── Media ── */
    .card-media {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4 / 3;
      background: var(--bg-2);
    }

    .card-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      display: block;
    }

    .product-card:hover .card-img { transform: scale(1.06); }

    .card-img-duo {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .card-img-duo-item {
      width: 50%; height: 100%;
      object-fit: contain;
      background: var(--bg-2);
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .card-img-duo-item { transform: scale(1.06); }

    /* ── Crimson accent bar sliding up from bottom ── */
    .card-accent-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: var(--accent);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .card-accent-bar { transform: scaleX(1); }

    /* ── Shimmer ── */
    .card-holo {
      position: absolute;
      inset: 0;
      background: var(--holo-gradient);
      background-size: 200% 100%;
      transform: translateX(-150%) skewX(-12deg);
      pointer-events: none;
      z-index: 2;
    }

    .product-card:hover .card-holo {
      animation: holo-pass 0.7s ease-out forwards;
    }

    /* ── Badges ── */
    .card-badge {
      position: absolute;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }

    .video-badge {
      top: 10px; right: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.12);
    }

    .video-badge .material-icons { font-size: 16px; }

    .stock-badge { top: 10px; left: 10px; }

    .stock-badge--out {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239,68,68,0.3);
    }

    .stock-badge--low {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245,158,11,0.3);
    }

    /* ── Overlay ── */
    .card-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.28s ease;
      z-index: 2;
    }

    .product-card:hover .card-overlay { opacity: 1; }

    .overlay-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: var(--accent);
      color: #fff;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transform: translateY(10px);
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .overlay-cta { transform: translateY(0); }
    .overlay-cta .material-icons { font-size: 15px; }

    /* ── Meta ── */
    .card-meta {
      padding: 18px 20px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 6px;
      background: var(--bg-card);
      transition: background 0.25s ease;
    }

    .product-card:hover .card-meta { background: var(--bg-card-hover); }

    .card-cat {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--accent);
    }

    .card-name {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.4;
      margin: 0;
    }

    .card-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .card-price {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.02em;
    }

    .card-arrow {
      width: 28px; height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      transition: all 0.25s;
    }

    .product-card:hover .card-arrow {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .card-arrow .material-icons { font-size: 14px; transition: transform 0.25s; }
    .product-card:hover .card-arrow .material-icons { transform: translateX(2px); }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private el: HTMLElement;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {
    this.el = elRef.nativeElement;
  }

  onCardClick(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  onEnter(): void {
    const card = this.el.querySelector('.product-card') as HTMLElement;
    if (card) card.style.transition = 'transform 0.08s ease-out, box-shadow 0.35s ease, border-color 0.25s ease';
  }

  onLeave(): void {
    const card = this.el.querySelector('.product-card') as HTMLElement;
    if (card) {
      card.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.25s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    }
  }

  onMove(event: MouseEvent): void {
    const card = this.el.querySelector('.product-card') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
}
