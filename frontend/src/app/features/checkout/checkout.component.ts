import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, Order } from '../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  template: `
    <div class="checkout-page container">
      <a routerLink="/cart" class="back-link">
        <span class="material-icons">arrow_back</span>
        Back to Cart
      </a>

      <h1 class="checkout-title">Checkout</h1>

      @if (successOrder) {
        <div class="success-screen">
          <div class="success-icon">
            <span class="material-icons">check_circle</span>
          </div>
          <h2>Payment Successful!</h2>
          <p class="success-msg">Your order has been placed.</p>
          <div class="order-ref">
            <span>Order #{{ successOrder.id }}</span>
          </div>
          <p class="redirect-msg">Redirecting to your orders...</p>
        </div>
      } @else if (cart) {
        <div class="checkout-layout">

          <!-- Left: Card form -->
          <div class="checkout-form">
            <!-- Card preview -->
            <div class="card-preview">
              <div class="card-visual">
                <div class="card-chip"></div>
                <div class="card-number">{{ formattedCardNumber || '•••• •••• •••• ••••' }}</div>
                <div class="card-row">
                  <div class="card-field">
                    <span class="card-field-label">Cardholder</span>
                    <span class="card-field-value">{{ cardholderName || 'Your Name' }}</span>
                  </div>
                  <div class="card-field">
                    <span class="card-field-label">Expires</span>
                    <span class="card-field-value">{{ expiryDate || 'MM/YY' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form fields -->
            <div class="form-group">
              <label>Cardholder Name</label>
              <input type="text" class="form-input" [(ngModel)]="cardholderName" placeholder="John Doe"
                     (input)="validateField('name')">
              @if (errors['name']) {
                <span class="field-error">{{ errors['name'] }}</span>
              }
            </div>

            <div class="form-group">
              <label>Card Number</label>
              <input type="text" class="form-input card-number-input" [(ngModel)]="cardNumber"
                     (input)="onCardNumberInput($event)" placeholder="1234 5678 9012 3456" maxlength="19">
              @if (errors['cardNumber']) {
                <span class="field-error">{{ errors['cardNumber'] }}</span>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" class="form-input" [(ngModel)]="expiryDate"
                       (input)="onExpiryInput($event)" placeholder="MM/YY" maxlength="5">
                @if (errors['expiry']) {
                  <span class="field-error">{{ errors['expiry'] }}</span>
                }
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input type="password" class="form-input" [(ngModel)]="cvv"
                       (input)="onCvvInput($event)" placeholder="•••" maxlength="3">
                @if (errors['cvv']) {
                  <span class="field-error">{{ errors['cvv'] }}</span>
                }
              </div>
            </div>

            <button class="btn-pay" (click)="pay()" [disabled]="submitting">
              @if (submitting) {
                <span class="btn-spinner"></span> Processing...
              } @else {
                <span class="material-icons">lock</span>
                Pay \${{ cart.total | number:'1.2-2' }}
              }
            </button>
          </div>

          <!-- Right: Order summary -->
          <aside class="checkout-summary">
            <h3>Order Summary</h3>
            @for (item of cart.items; track item.id) {
              <div class="summary-item">
                <img [src]="item.imageUrl" [alt]="item.productName" class="summary-item-img"
                     onerror="this.src='https://placehold.co/60x60/1a1a2e/7C6FF7?text=E'">
                <div class="summary-item-info">
                  <span class="summary-item-name">{{ item.productName }}</span>
                  <span class="summary-item-qty">Qty: {{ item.quantity }}</span>
                </div>
                <span class="summary-item-price">\${{ item.subtotal | number:'1.2-2' }}</span>
              </div>
            }
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total</span>
              <span class="summary-total-amount">\${{ cart.total | number:'1.2-2' }}</span>
            </div>
          </aside>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading cart...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 32px 0 80px;
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
      margin-bottom: 20px;
      transition: opacity 0.2s;
    }
    .back-link:hover { opacity: 0.8; }
    .back-link .material-icons { font-size: 18px; }

    .checkout-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 32px;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 40px;
      align-items: start;
    }

    /* Card preview */
    .card-preview {
      margin-bottom: 32px;
    }

    .card-visual {
      width: 100%;
      max-width: 420px;
      aspect-ratio: 1.586;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }

    .card-visual::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      background: var(--accent-primary-glow);
      border-radius: 50%;
      opacity: 0.15;
    }

    .card-chip {
      width: 44px;
      height: 34px;
      background: linear-gradient(135deg, #d4a574, #b8865a);
      border-radius: 6px;
      position: absolute;
      top: 28px;
      left: 28px;
    }

    .card-number {
      font-family: 'Courier New', monospace;
      font-size: clamp(1.2rem, 2.5vw, 1.6rem);
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.95);
      text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }

    .card-row {
      display: flex;
      gap: 40px;
    }

    .card-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-field-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.5);
      font-family: 'DM Sans', sans-serif;
    }

    .card-field-value {
      font-family: 'Courier New', monospace;
      font-size: 15px;
      color: rgba(255,255,255,0.9);
    }

    /* Form */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
      letter-spacing: 0.02em;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      background: var(--bg-input);
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-glow);
    }

    .form-input.ng-invalid.ng-touched {
      border-color: var(--danger);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-error {
      display: block;
      margin-top: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--danger);
    }

    .btn-pay {
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
      margin-top: 8px;
    }

    .btn-pay:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-pay .material-icons { font-size: 18px; }

    .btn-spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Order summary */
    .checkout-summary {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: 28px;
      position: sticky;
      top: 100px;
    }

    .checkout-summary h3 {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
    }

    .summary-item-img {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: var(--bg-secondary);
      flex-shrink: 0;
    }

    .summary-item-info {
      flex: 1;
      min-width: 0;
    }

    .summary-item-name {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .summary-item-qty {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .summary-item-price {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 700;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-primary);
      margin: 16px 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
    }

    .summary-total-amount {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    /* Success screen */
    .success-screen {
      text-align: center;
      padding: 60px 0;
      max-width: 480px;
      margin: 0 auto;
    }

    .success-icon .material-icons {
      font-size: 72px;
      color: var(--success);
    }

    .success-screen h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      margin: 16px 0 8px;
    }

    .success-msg {
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
    }

    .order-ref {
      margin: 24px 0;
      padding: 16px 24px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .redirect-msg {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 80px 0;
      color: var(--text-tertiary);
    }

    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--border-primary);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 768px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  cardholderName = '';
  cardNumber = '';
  expiryDate = '';
  cvv = '';
  submitting = false;
  successOrder: Order | null = null;

  errors: Record<string, string> = {};

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.auth.userId;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.getCart(userId).subscribe({
      next: (res) => {
        this.cart = res.data;
        if (!this.cart || this.cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      }
    });
  }

  get formattedCardNumber(): string {
    const digits = this.cardNumber.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.validateField('cardNumber');
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    this.expiryDate = val;
    this.validateField('expiry');
  }

  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cvv = input.value.replace(/\D/g, '').slice(0, 3);
    this.validateField('cvv');
  }

  validateField(field: string): void {
    const newErrors: Record<string, string> = {};
    if (field === 'name' || field === 'all') {
      if (!this.cardholderName.trim()) {
        newErrors['name'] = 'Cardholder name is required';
      }
    }
    if (field === 'cardNumber' || field === 'all') {
      const digits = this.cardNumber.replace(/\D/g, '');
      if (digits.length !== 16) {
        newErrors['cardNumber'] = 'Card number must be 16 digits';
      }
    }
    if (field === 'expiry' || field === 'all') {
      const parts = this.expiryDate.split('/');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        newErrors['expiry'] = 'Enter valid MM/YY';
      } else {
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10) + 2000;
        const now = new Date();
        const expiry = new Date(year, month, 0);
        if (month < 1 || month > 12 || parts[0].length !== 2 || parts[1].length !== 2) {
          newErrors['expiry'] = 'Enter valid MM/YY';
        } else if (expiry < now) {
          newErrors['expiry'] = 'Card is expired';
        }
      }
    }
    if (field === 'cvv' || field === 'all') {
      if (this.cvv.length !== 3) {
        newErrors['cvv'] = 'CVV must be 3 digits';
      }
    }

    if (field === 'all') {
      this.errors = newErrors;
    } else {
      this.errors = { ...this.errors, ...newErrors };
      if (!newErrors[field]) {
        const updated: Record<string, string> = {};
        for (const key of Object.keys(this.errors)) {
          if (key !== field) {
            updated[key] = this.errors[key];
          }
        }
        this.errors = updated;
      }
    }
  }

  validate(): boolean {
    this.validateField('all');
    return Object.keys(this.errors).length === 0;
  }

  pay(): void {
    if (!this.validate()) return;
    if (!this.cart || this.cart.items.length === 0) return;

    const userId = this.auth.userId;
    if (!userId) return;

    this.submitting = true;
    this.api.placeOrder(userId).subscribe({
      next: (res) => {
        this.successOrder = res.data;
        this.submitting = false;
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 3000);
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.open(err.error?.message || 'Payment failed', 'Close', { duration: 5000 });
      }
    });
  }
}
