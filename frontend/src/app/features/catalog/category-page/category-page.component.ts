import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, ProductCardComponent],
  template: `
    <div class="category-page container">
      <a routerLink="/products" class="back-link">
        <span class="material-icons">arrow_back</span>
        Back to Shop
      </a>

      <h1 class="category-heading">{{ categoryName }}</h1>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>Loading products...</span>
        </div>
      } @else if (products.length === 0) {
        <p class="empty-msg">No products found in this category.</p>
      } @else {
        <div class="cat-grid">
          @for (product of products; track product.id) {
            <app-product-card [product]="product"></app-product-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .category-page {
      padding: 40px 0 80px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-primary);
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
      transition: opacity 0.2s;
    }
    .back-link:hover {
      opacity: 0.8;
    }
    .back-link .material-icons {
      font-size: 18px;
    }
    .category-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--accent-primary);
      margin: 0 0 40px;
      line-height: 1.1;
    }
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
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
    .empty-msg {
      text-align: center;
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      padding: 60px 0;
    }
  `]
})
export class CategoryPageComponent implements OnInit {
  categoryName = '';
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryName = params['categoryName'];
      this.loadProducts();
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (res) => {
        this.products = res.data.filter(
          p => p.categoryName?.toLowerCase() === this.categoryName?.toLowerCase()
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }
}
