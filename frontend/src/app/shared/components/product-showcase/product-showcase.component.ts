import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { ScrollRevealDirective } from '../../animations/scroll-reveal.directive';

@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section class="showcase" id="products-section">
      <div class="showcase-head" appScrollReveal="fade-up">
        <span class="showcase-tag">Featured Products</span>
        <h2 class="showcase-heading">The Best of Tech</h2>
      </div>

      <article class="showcase-featured">
        <div class="featured-visual">
          <img [src]="featured.imageUrl" [alt]="featured.name" loading="lazy" />
        </div>
        <div class="featured-body">
          <h3>{{ featured.name }}</h3>
          <p>{{ featured.description }}</p>
          <span class="featured-price">\${{ featured.price | number:'1.2-2' }}</span>
        </div>
      </article>

      <div class="showcase-grid">
        <div
          class="grid-item"
          *ngFor="let product of products; let i = index"
          appScrollReveal="fade-up"
          [revealDelay]="i * 0.1"
          (mouseenter)="hoverIndex = i"
          (mouseleave)="hoverIndex = null"
        >
          <div class="item-visual">
            <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
          </div>
          <div class="item-body">
            <span class="item-cat">{{ product.categoryName }}</span>
            <h4>{{ product.name }}</h4>
            <span class="item-price">\${{ product.price | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .showcase {
      padding: 6rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .showcase-head {
      text-align: center;
      margin-bottom: 4rem;
    }

    .showcase-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent-primary);
    }

    .showcase-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      color: #fff;
      margin-top: 0.5rem;
    }

    .showcase-featured {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 3rem;
      align-items: center;
      margin-bottom: 6rem;
      padding: 2rem;
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-primary);
    }

    .featured-visual img {
      width: 100%;
      border-radius: var(--radius-lg);
      aspect-ratio: 4/3;
      object-fit: cover;
    }

    .featured-body h3 {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .featured-body p {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .featured-price {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .grid-item {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-primary);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      cursor: pointer;
    }

    .grid-item:hover {
      transform: translateY(-6px);
      border-color: var(--border-accent);
      box-shadow: var(--shadow-float);
    }

    .item-visual img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .grid-item:hover .item-visual img {
      transform: scale(1.06);
    }

    .item-body {
      padding: 1.25rem;
    }

    .item-cat {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .item-body h4 {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.05rem;
      color: var(--text-primary);
      margin: 0.5rem 0;
      font-weight: 600;
    }

    .item-price {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    @media (max-width: 768px) {
      .showcase-featured {
        grid-template-columns: 1fr;
      }

      .showcase {
        padding: 3rem 1rem;
      }
    }
  `],
})
export class ProductShowcaseComponent {
  @Input() products: Product[] = [];
  hoverIndex: number | null = null;

  get featured(): Product {
    return this.products[0] || {} as Product;
  }
}
