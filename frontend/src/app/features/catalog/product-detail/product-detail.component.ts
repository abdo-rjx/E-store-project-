import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Review } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (!product) {
      <div class="page-loader">
        <div class="loader-skeleton">
          <div class="ghost ghost-visual"></div>
          <div class="ghost-details">
            <div class="ghost ghost-xs"></div>
            <div class="ghost ghost-title"></div>
            <div class="ghost ghost-sub"></div>
            <div class="ghost ghost-desc"></div>
          </div>
        </div>
      </div>
    } @else {
      <!-- Breadcrumb -->
      <nav class="crumb">
        <a routerLink="/products" class="crumb-link">
          <span class="material-icons">arrow_back</span>
          Back to Shop
        </a>
      </nav>

      <!-- Product Layout -->
      <div class="product-stage">
        <!-- Visual side -->
        <section class="stage-visual reveal">
          <div class="media-gallery">
            <div class="media-main">
              @if (selectedMedia.type === 'video') {
                <video [src]="selectedMedia.src" controls autoplay muted class="media-content"></video>
              } @else {
                <img [src]="selectedMedia.src" [alt]="product.name" class="media-content"
                     onerror="this.src='https://placehold.co/600x500/1a1a2e/7C6FF7?text=E-Store'">
              }
              @if (product.stock <= 5 && product.stock > 0) {
                <div class="media-tag media-tag--low">Only {{ product.stock }} left</div>
              }
              @if (product.stock === 0) {
                <div class="media-tag media-tag--out">Sold Out</div>
              }
            </div>

            @if (allMedia.length > 1) {
              <div class="media-strip">
                @for (media of allMedia; track media.src; let i = $index) {
                  <button class="strip-thumb" [class.is-selected]="i === activeMediaIndex" (click)="selectMedia(i)">
                    @if (media.type === 'video') {
                      <video [src]="media.src" muted class="thumb-visual"></video>
                      <span class="thumb-play">
                        <span class="material-icons">play_arrow</span>
                      </span>
                    } @else {
                      <img [src]="media.src" class="thumb-visual">
                    }
                  </button>
                }
              </div>
            }
          </div>
        </section>

        <!-- Info side -->
        <section class="stage-info reveal reveal-delay-1">
          <span class="info-tag">{{ product.categoryName }}</span>
          <h1 class="info-title">{{ product.name }}</h1>

          <div class="info-price-row">
            <span class="info-price">\${{ product.price | number:'1.2-2' }}</span>
            @if (product.stock > 0) {
              <span class="tag-success">In Stock</span>
            } @else {
              <span class="tag-danger">Out of Stock</span>
            }
          </div>

          <p class="info-body">{{ product.description }}</p>

          <div class="info-perks">
            <div class="perk">
              <span class="material-icons">verified</span>
              <span>Authentic</span>
            </div>
            <div class="perk">
              <span class="material-icons">local_shipping</span>
              <span>Free Shipping</span>
            </div>
            <div class="perk">
              <span class="material-icons">shield</span>
              <span>Warranty</span>
            </div>
          </div>

          @if (authService.isLoggedIn && product.stock > 0) {
            <div class="cart-actions">
              <div class="qty">
                <button class="qty-btn" (click)="quantity > 1 && (quantity = quantity - 1)">
                  <span class="material-icons">remove</span>
                </button>
                <span class="qty-num">{{ quantity }}</span>
                <button class="qty-btn" (click)="quantity = quantity + 1">
                  <span class="material-icons">add</span>
                </button>
              </div>
              <button class="btn-cart" (click)="addToCart()" [disabled]="loading">
                <span class="material-icons">shopping_bag</span>
                @if (loading) { Adding... } @else { Add to Cart }
              </button>
            </div>
          } @else if (!authService.isLoggedIn) {
            <a routerLink="/login" class="btn-outline">
              Sign in to purchase
            </a>
          }
        </section>
      </div>

      <!-- Reviews -->
      <section class="reviews-block reveal">
        <div class="reviews-head">
          <h2>Customer Reviews</h2>
          <span class="reviews-count">{{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}</span>
        </div>

        @if (authService.isLoggedIn) {
          <div class="review-compose">
            <h3>Write a Review</h3>
            <div class="compose-form">
              <div class="compose-stars">
                @for (star of [1,2,3,4,5]; track star) {
                  <button class="compose-star" [class.is-on]="star <= newReview.rating"
                          (click)="newReview.rating = star">
                    <span class="material-icons">{{ star <= newReview.rating ? 'star' : 'star_border' }}</span>
                  </button>
                }
              </div>
              <div class="es-input-group">
                <textarea class="es-input" [(ngModel)]="newReview.comment"
                          rows="3" placeholder="Share your experience..."></textarea>
              </div>
              <button class="btn-submit" (click)="submitReview()">
                Submit Review
              </button>
            </div>
          </div>
        }

        @if (reviews.length === 0) {
          <div class="reviews-empty">
            <span class="material-icons">rate_review</span>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        } @else {
          <div class="reviews-feed">
            @for (review of reviews; track review.id) {
              <article class="review-card">
                <div class="review-head">
                  <div class="review-avatar">{{ review.authorName.charAt(0) }}</div>
                  <div class="review-author">
                    <span class="review-name">{{ review.authorName }}</span>
                    <span class="review-time">{{ review.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <div class="review-rating">
                    @for (s of [1,2,3,4,5]; track s) {
                      <span class="material-icons star" [class.is-filled]="s <= review.rating">
                        {{ s <= review.rating ? 'star' : 'star_border' }}
                      </span>
                    }
                  </div>
                </div>
                <p class="review-body">{{ review.comment }}</p>
              </article>
            }
          </div>
        }
      </section>
    }
  `,
  styles: [`
    /* LOADER */
    .page-loader { padding: 48px 0; }

    .loader-skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }

    .ghost-visual { aspect-ratio: 4/3; border-radius: var(--radius-lg); }
    .ghost-details { display: flex; flex-direction: column; gap: 18px; padding: 20px 0; }
    .ghost-xs { height: 14px; width: 30%; }
    .ghost-title { height: 36px; width: 70%; }
    .ghost-sub { height: 24px; width: 50%; }
    .ghost-desc { height: 60px; width: 90%; }

    /* Breadcrumb */
    .crumb { margin-bottom: 28px; }

    .crumb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }

    .crumb-link:hover { color: var(--accent-primary); }
    .crumb-link .material-icons { font-size: 18px; }

    /* Stage layout */
    .product-stage {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 56px;
      margin-bottom: 72px;
    }

    /* Visual section */
    .media-gallery {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .media-main {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
    }

    .media-content {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      display: block;
    }

    .media-tag {
      position: absolute;
      top: 16px;
      left: 16px;
      padding: 6px 16px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .media-tag--low {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .media-tag--out {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Thumbnails strip */
    .media-strip {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0;
    }

    .strip-thumb {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.25s ease;
      flex-shrink: 0;
      position: relative;
      background: transparent;
      padding: 0;
    }

    .strip-thumb:hover {
      border-color: var(--border-secondary);
      transform: translateY(-2px);
    }

    .strip-thumb.is-selected {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 1px var(--accent-primary);
    }

    .thumb-visual {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb-play {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
    }

    .thumb-play .material-icons { font-size: 22px; }

    /* Info section */
    .stage-info {
      display: flex;
      flex-direction: column;
      padding: 12px 0;
    }

    .info-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      margin-bottom: 10px;
    }

    .info-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 18px;
      color: var(--text-primary);
      line-height: 1.15;
    }

    .info-price-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-price {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .info-body {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 28px;
    }

    /* Perks */
    .info-perks {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 32px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
    }

    .perk {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .perk .material-icons {
      font-size: 18px;
      color: var(--accent-primary);
    }

    /* Cart actions */
    .cart-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .qty {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .qty-btn:hover {
      background: var(--accent-primary-glow);
      color: var(--accent-primary);
    }

    .qty-btn .material-icons { font-size: 18px; }

    .qty-num {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 700;
      min-width: 28px;
      text-align: center;
    }

    .btn-cart {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .btn-cart:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-cart:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-cart .material-icons { font-size: 18px; }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-secondary);
      text-decoration: none;
      margin-top: 28px;
      transition: all 0.3s ease;
    }

    .btn-outline:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    /* Reviews */
    .reviews-block {
      padding: 48px 0;
      border-top: 1px solid var(--border-primary);
    }

    .reviews-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .reviews-head h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .reviews-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-tertiary);
    }

    /* Compose */
    .review-compose {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 36px;
    }

    .review-compose h3 {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .compose-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .compose-stars {
      display: flex;
      gap: 4px;
    }

    .compose-star {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--text-tertiary);
      transition: all 0.15s;
    }

    .compose-star.is-on { color: #FBBF24; }
    .compose-star:hover { transform: scale(1.2); }
    .compose-star .material-icons { font-size: 26px; }

    .btn-submit {
      align-self: flex-start;
      padding: 12px 28px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 12px var(--accent-primary-glow);
    }

    .btn-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--accent-primary-glow);
    }

    /* Empty reviews */
    .reviews-empty {
      text-align: center;
      padding: 48px;
      color: var(--text-tertiary);
      font-family: 'DM Sans', sans-serif;
    }

    .reviews-empty .material-icons {
      font-size: 48px;
      margin-bottom: 12px;
    }

    /* Review feed */
    .reviews-feed {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      padding: 20px;
      transition: border-color 0.3s;
    }

    .review-card:hover {
      border-color: var(--border-secondary);
    }

    .review-head {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .review-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .review-author {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .review-name {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }

    .review-time {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .review-rating {
      display: flex;
      gap: 2px;
    }

    .star { font-size: 16px; color: var(--text-tertiary); }
    .star.is-filled { color: #FBBF24; }

    .review-body {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .product-stage {
        grid-template-columns: 1fr;
        gap: 28px;
      }

      .loader-skeleton {
        grid-template-columns: 1fr;
      }

      .cart-actions {
        flex-direction: column;
      }

      .btn-cart { width: 100%; }

      .strip-thumb {
        width: 56px;
        height: 56px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  quantity = 1;
  loading = false;
  newReview = { rating: 5, comment: '' };
  activeMediaIndex = 0;

  get allMedia(): { type: 'image' | 'video'; src: string }[] {
    if (!this.product) return [];
    const media: { type: 'image' | 'video'; src: string }[] = [];

    if (this.product.videoPath) {
      media.push({ type: 'video', src: this.product.videoPath });
    }

    const images = this.product.imagePaths || [];
    for (const img of images) {
      media.push({ type: 'image', src: img });
    }

    if (media.length === 0 && this.product.imageUrl) {
      media.push({ type: 'image', src: this.product.imageUrl });
    }

    return media;
  }

  get selectedMedia() {
    return this.allMedia[this.activeMediaIndex] || { type: 'image', src: '' };
  }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProduct(id).subscribe({
      next: (res) => {
        this.product = res.data;
        setTimeout(() => this.revealElements(), 100);
      },
      error: () => this.snackBar.open('Product not found', 'Close', { duration: 3000 })
    });
    this.loadReviews(id);
  }

  selectMedia(index: number) {
    this.activeMediaIndex = index;
  }

  private revealElements(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
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
