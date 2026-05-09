import { Component, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/products', product.id]" class="card-link">
      <article class="es-card product-card"
               #cardEl
               (click)="onCardClick()"
               (mouseenter)="onEnter()"
               (mouseleave)="onLeave()"
               (mousemove)="onMove($event)">
        <div class="card-media">
          @if (product.imagePaths && product.imagePaths.length >= 2) {
            <div class="card-img-duo">
              <img [src]="product.imagePaths[0]" [alt]="product.name" class="card-img-duo-item"
                   onerror="this.src='https://placehold.co/400x300/1a1a2e/7C6FF7?text=E-Store'">
              <img [src]="product.imagePaths[1]" [alt]="product.name" class="card-img-duo-item"
                   onerror="this.src='https://placehold.co/400x300/1a1a2e/7C6FF7?text=E-Store'">
            </div>
          } @else {
            <img [src]="product.imageUrl" [alt]="product.name" class="card-img"
                 onerror="this.src='https://placehold.co/400x300/1a1a2e/7C6FF7?text=E-Store'">
          }
          <div class="card-shimmer"></div>

          @if (product.videoPath) {
            <div class="card-badge video-badge">
              <span class="material-icons">play_circle</span>
            </div>
          }

          @if (product.stock === 0) {
            <div class="card-badge stock-badge stock-badge--out">Sold Out</div>
          } @else if (product.stock <= 5) {
            <div class="card-badge stock-badge stock-badge--low">Only {{ product.stock }} left</div>
          }

          <div class="card-overlay">
            <span class="overlay-text">View Details</span>
          </div>
        </div>

        <div class="card-meta">
          <span class="card-cat">{{ product.categoryName }}</span>
          <h3 class="card-name">{{ product.name }}</h3>
          <div class="card-row">
            <span class="card-ammount">\${{ product.price | number:'1.2-2' }}</span>
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
      border-radius: var(--radius-lg);
      overflow: hidden;
      will-change: transform;
      transform-style: preserve-3d;
      transition: transform 0.15s ease-out, box-shadow 0.4s ease;
      cursor: pointer;
    }

    .product-card:hover {
      box-shadow: var(--shadow-float);
    }

    .product-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-primary);
      pointer-events: none;
      transition: border-color 0.4s ease;
      z-index: 3;
    }

    .product-card:hover::after {
      border-color: var(--border-accent);
    }

    /* Media area */
    .card-media {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4 / 3;
      background: var(--bg-secondary);
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .card-img {
      transform: scale(1.1);
    }

    .card-img-duo {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 260px;
      overflow: hidden;
    }

    .card-img-duo-item {
      width: 50%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .card-img-duo-item {
      transform: scale(1.1);
    }

    .card-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 40%,
        rgba(255, 255, 255, 0.03) 45%,
        rgba(255, 255, 255, 0.06) 50%,
        rgba(255, 255, 255, 0.03) 55%,
        transparent 60%
      );
      transform: translateX(-100%);
      transition: none;
    }

    .product-card:hover .card-shimmer {
      animation: shimmer 1.5s ease forwards;
    }

    @keyframes shimmer {
      to { transform: translateX(100%); }
    }

    /* Badges */
    .card-badge {
      position: absolute;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      border-radius: var(--radius-pill);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
    }

    .video-badge {
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
    }

    .video-badge .material-icons { font-size: 20px; }

    .stock-badge {
      top: 12px;
      left: 12px;
    }

    .stock-badge--out {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .stock-badge--low {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Overlay */
    .card-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
    }

    .product-card:hover .card-overlay { opacity: 1; }

    .overlay-text {
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.06em;
      padding: 8px 20px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: var(--radius-pill);
      backdrop-filter: blur(4px);
      transform: translateY(8px);
      transition: transform 0.3s ease;
    }

    .product-card:hover .overlay-text { transform: translateY(0); }

    /* Meta area */
    .card-meta {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 6px;
      background: var(--bg-card);
      position: relative;
      z-index: 1;
    }

    .card-cat {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      font-family: 'DM Sans', sans-serif;
    }

    .card-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.35;
      margin: 0;
    }

    .card-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 14px;
    }

    .card-ammount {
      font-family: 'Playfair Display', serif;
      font-size: 19px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .card-arrow {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-primary);
      transition: gap 0.3s;
      font-family: 'DM Sans', sans-serif;
    }

    .card-arrow .material-icons {
      font-size: 16px;
      transition: transform 0.3s;
    }

    .product-card:hover .card-arrow { gap: 8px; }
    .product-card:hover .card-arrow .material-icons { transform: translateX(4px); }
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
    if (card) {
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.4s ease';
    }
  }

  onLeave(): void {
    const card = this.el.querySelector('.product-card') as HTMLElement;
    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    }
  }

  onMove(event: MouseEvent): void {
    const card = this.el.querySelector('.product-card') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
}
