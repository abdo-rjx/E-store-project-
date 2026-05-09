import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-stage container">
      <div class="cart-prologue">
        <h1>Review Cart</h1>
        <p class="cart-subtitle">Secure checkout powered by Estoré.</p>
      </div>

      @if (cart && cart.items.length === 0) {
        <div class="cart-empty">
          <div class="empty-inner">
            <span class="material-icons empty-icon">shopping_bag</span>
            <h3>Your cart is empty</h3>
            <p>Discover our premium electronics collection.</p>
            <a routerLink="/products" class="btn-browse">
              Browse Products
              <span class="material-icons">arrow_forward</span>
            </a>
          </div>
        </div>
      } @else if (cart) {
        <div class="cart-layout">
          <!-- Items -->
          <div class="cart-items">
            @for (item of cart.items; track item.id) {
              <article class="cart-item">
                <img [src]="item.imageUrl" [alt]="item.productName" class="item-visual"
                     onerror="this.src='https://placehold.co/100x100/1a1a2e/7C6FF7?text=E-Store'">
                <div class="item-info">
                  <h3 class="item-name">{{ item.productName }}</h3>
                  <span class="item-rate">\${{ item.unitPrice | number:'1.2-2' }}</span>
                </div>
                <div class="item-qty">
                  <button class="qty-btn" (click)="updateQty(item, item.quantity - 1)"
                          [disabled]="item.quantity <= 1">
                    <span class="material-icons">remove</span>
                  </button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="updateQty(item, item.quantity + 1)">
                    <span class="material-icons">add</span>
                  </button>
                </div>
                <div class="item-subtotal">
                  \${{ item.subtotal | number:'1.2-2' }}
                </div>
                <button class="item-remove" (click)="removeItem(item)" title="Remove">
                  <span class="material-icons">delete_outline</span>
                </button>
              </article>
            }
          </div>

          <!-- Summary -->
          <aside class="cart-summary">
            <h2 class="summary-label">Summary</h2>

            <div class="summary-line">
              <span>Subtotal</span>
              <span>\${{ cart.total | number:'1.2-2' }}</span>
            </div>
            <div class="summary-line">
              <span>Shipping</span>
              <span class="summary-accent">Complimentary</span>
            </div>
            <div class="summary-line">
              <span>Taxes</span>
              <span class="summary-muted">Calculated at next step</span>
            </div>

            <div class="summary-sep"></div>

            <div class="summary-line summary-total">
              <span>TOTAL</span>
              <span class="summary-amount">\${{ cart.total | number:'1.2-2' }}</span>
            </div>

            <button class="btn-checkout"
                    (click)="checkout()" [disabled]="loading">
              @if (loading) {
                <span class="btn-spinner"></span> Processing...
              } @else {
                Proceed to Checkout
                <span class="material-icons">lock</span>
              }
            </button>

            <p class="secure-note">
              <span class="material-icons">verified_user</span>
              256-bit Encrypted Transaction
            </p>
          </aside>
        </div>
      } @else {
        <div class="cart-loader">
          <div class="ghost ghost-line"></div>
          <div class="ghost ghost-line"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-stage { padding: 24px 0; }

    .cart-prologue { margin-bottom: 36px; }

    .cart-prologue h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .cart-subtitle {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      font-size: 15px;
      margin-top: 6px;
    }

    /* Empty */
    .cart-empty {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .empty-inner {
      text-align: center;
      max-width: 360px;
    }

    .empty-icon {
      font-size: 68px;
      color: var(--text-tertiary);
      margin-bottom: 16px;
    }

    .empty-inner h3 {
      font-family: 'DM Sans', sans-serif;
      margin-bottom: 8px;
    }

    .empty-inner p {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .btn-browse {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .btn-browse:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-browse .material-icons { font-size: 18px; }

    /* Layout */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    /* Items */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      transition: all 0.3s;
    }

    .cart-item:hover {
      border-color: var(--border-secondary);
    }

    .item-visual {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-rate {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .item-qty {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-primary);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--accent-primary-glow);
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-btn .material-icons { font-size: 18px; }

    .qty-val {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 700;
      min-width: 28px;
      text-align: center;
    }

    .item-subtotal {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      min-width: 90px;
      text-align: right;
    }

    .item-remove {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--text-tertiary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .item-remove:hover {
      color: var(--danger);
      background: var(--danger-bg);
    }

    .item-remove .material-icons { font-size: 18px; }

    /* Summary */
    .cart-summary {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: 28px;
      position: sticky;
      top: 100px;
    }

    .summary-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 24px;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .summary-accent {
      color: var(--accent-primary);
      font-weight: 600;
    }

    .summary-muted {
      color: var(--text-tertiary);
      font-size: 13px;
    }

    .summary-sep {
      height: 1px;
      background: var(--border-primary);
      margin: 16px 0;
    }

    .summary-total {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-tertiary);
      letter-spacing: 0.08em;
    }

    .summary-amount {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .btn-checkout {
      width: 100%;
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
      margin-top: 24px;
    }

    .btn-checkout:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-checkout:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-checkout .material-icons { font-size: 18px; }

    .secure-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .secure-note .material-icons { font-size: 14px; color: var(--success); }

    .btn-spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .cart-loader {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ghost-line { height: 120px; border-radius: var(--radius-lg); }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
      .item-subtotal { min-width: auto; text-align: left; flex-basis: 100%; margin-top: 8px; }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.api.getCart(userId).subscribe({
      next: (res) => { this.cart = res.data; }
    });
  }

  updateQty(item: CartItem, newQty: number): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.api.updateCartItem(userId, item.id, newQty).subscribe({
      next: (res) => {
        this.cart = res.data;
        this.snackBar.open('Cart updated', 'Close', { duration: 2000 });
      }
    });
  }

  removeItem(item: CartItem): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.api.removeFromCart(userId, item.id).subscribe({
      next: (res) => {
        this.cart = res.data;
        this.snackBar.open('Item removed', 'Close', { duration: 2000 });
      }
    });
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
