import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Review } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    @if (product) {
      <div class="product-detail">
        <mat-card>
          <mat-card-content>
            <div class="detail-layout">
              <div class="image-section">
                <img [src]="product.imageUrl" [alt]="product.name" class="product-image"
                     onerror="this.src='https://placehold.co/500x400?text=No+Image'">
              </div>
              <div class="info-section">
                <h1>{{ product.name }}</h1>
                <p class="category">{{ product.categoryName }}</p>
                <p class="price">{{ '$' + (product.price | number:'1.2-2') }}</p>
                <p class="description">{{ product.description }}</p>
                <p class="stock" [class.out-of-stock]="product.stock === 0">
                  {{ product.stock > 0 ? product.stock + ' available' : 'Out of stock' }}
                </p>

                @if (authService.isLoggedIn && product.stock > 0) {
                  <div class="add-to-cart">
                    <mat-form-field appearance="outline" class="qty-field">
                      <mat-label>Quantity</mat-label>
                      <mat-select [(ngModel)]="quantity">
                        @for (n of [1,2,3,4,5,6,7,8,9,10]; track n) {
                          <mat-option [value]="n">{{ n }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="addToCart()" [disabled]="loading">
                      <mat-icon>shopping_cart</mat-icon>
                      Add to Cart
                    </button>
                  </div>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="reviews-section">
          <mat-card-header>
            <mat-card-title>Reviews</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (authService.isLoggedIn) {
              <div class="review-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Rating</mat-label>
                  <mat-select [(ngModel)]="newReview.rating">
                    <mat-option [value]="5">5 - Excellent</mat-option>
                    <mat-option [value]="4">4 - Good</mat-option>
                    <mat-option [value]="3">3 - Average</mat-option>
                    <mat-option [value]="2">2 - Poor</mat-option>
                    <mat-option [value]="1">1 - Terrible</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Comment</mat-label>
                  <textarea matInput [(ngModel)]="newReview.comment" rows="3"></textarea>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="submitReview()">Submit Review</button>
              </div>
            }

            @if (reviews.length === 0) {
              <p class="text-center">No reviews yet. Be the first to review!</p>
            } @else {
              @for (review of reviews; track review.id) {
                <div class="review-item">
                  <div class="review-header">
                    <strong>{{ review.authorName }}</strong>
                    <span class="rating">Rating: {{ review.rating }}/5</span>
                    <span class="date">{{ review.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <p>{{ review.comment }}</p>
                </div>
              }
            }
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .detail-layout { display: flex; gap: 32px; flex-wrap: wrap; }
    .image-section { flex: 1; min-width: 300px; }
    .info-section { flex: 1; min-width: 300px; }
    .product-image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; }
    .category { color: #666; font-size: 14px; margin: 8px 0; }
    .price { font-size: 28px; font-weight: bold; color: #1a73e8; margin: 16px 0; }
    .description { color: #555; line-height: 1.6; }
    .stock { font-size: 14px; color: #4caf50; font-weight: 500; }
    .out-of-stock { color: #f44336; }
    .add-to-cart { display: flex; gap: 16px; align-items: center; margin-top: 24px; }
    .qty-field { width: 100px; }
    .reviews-section { margin-top: 24px; }
    .review-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    .review-item { padding: 16px 0; border-bottom: 1px solid #eee; }
    .review-header { display: flex; gap: 16px; align-items: center; margin-bottom: 8px; }
    .rating { color: #ff9800; }
    .date { color: #999; font-size: 12px; }
    .full-width { width: 100%; }
    .text-center { text-align: center; color: #666; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  quantity = 1;
  loading = false;
  newReview = { rating: 5, comment: '' };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProduct(id).subscribe({
      next: (res) => { this.product = res.data; },
      error: () => this.snackBar.open('Product not found', 'Close', { duration: 3000 })
    });
    this.loadReviews(id);
  }

  loadReviews(productId: number): void {
    this.api.getProductReviews(productId).subscribe({
      next: (res) => { this.reviews = res.data; }
    });
  }

  addToCart(): void {
    if (!this.product || !this.authService.userId) return;
    this.loading = true;
    this.api.addToCart(this.authService.userId, this.product.id, this.quantity).subscribe({
      next: () => {
        this.snackBar.open('Added to cart!', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  submitReview(): void {
    if (!this.product || !this.authService.currentUser) return;
    this.api.createReview({
      productId: this.product.id,
      userId: this.authService.userId!,
      authorName: this.authService.currentUser.firstName + ' ' + this.authService.currentUser.lastName,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: () => {
        this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
        this.newReview.comment = '';
        this.newReview.rating = 5;
        this.loadReviews(this.product!.id);
      }
    });
  }
}
