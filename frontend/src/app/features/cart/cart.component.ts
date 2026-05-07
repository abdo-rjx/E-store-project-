import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <h1>Shopping Cart</h1>

    @if (cart && cart.items.length === 0) {
      <mat-card class="empty-cart">
        <mat-card-content class="text-center">
          <mat-icon class="large-icon">shopping_cart</mat-icon>
          <p>Your cart is empty</p>
          <a routerLink="/products" mat-raised-button color="primary">Browse Products</a>
        </mat-card-content>
      </mat-card>
    } @else if (cart) {
      <div class="cart-container">
        <div class="cart-items">
          @for (item of cart.items; track item.id) {
            <mat-card class="cart-item">
              <mat-card-content>
                <div class="item-layout">
                  <img [src]="item.imageUrl" [alt]="item.productName" class="item-image"
                       onerror="this.src='https://placehold.co/80x80?text=N/A'">
                  <div class="item-info">
                    <h3>{{ item.productName }}</h3>
                    <p class="unit-price">Unit: {{ '$' + (item.unitPrice | number:'1.2-2') }}</p>
                  </div>
                  <div class="item-actions">
                    <button mat-icon-button (click)="updateQty(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button mat-icon-button (click)="updateQty(item, item.quantity + 1)">
                      <mat-icon>add</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="removeItem(item)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <div class="item-subtotal">
                    <p class="subtotal-price">{{ '$' + (item.subtotal | number:'1.2-2') }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <mat-card class="cart-summary">
          <mat-card-content>
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items ({{ cart.items.length }})</span>
              <span>{{ '$' + (cart.total | number:'1.2-2') }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ '$' + (cart.total | number:'1.2-2') }}</span>
            </div>
            <button mat-raised-button color="primary" class="checkout-btn" (click)="checkout()" [disabled]="loading">
              @if (loading) { Processing... } @else { Place Order }
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .empty-cart { text-align: center; padding: 40px; }
    .large-icon { font-size: 64px; height: 64px; width: 64px; color: #666; }
    .cart-container { display: flex; gap: 24px; flex-wrap: wrap; }
    .cart-items { flex: 2; min-width: 300px; }
    .cart-summary { flex: 1; min-width: 250px; height: fit-content; }
    .item-layout { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .item-image { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
    .item-info { flex: 1; min-width: 150px; }
    .unit-price { color: #666; font-size: 14px; }
    .item-actions { display: flex; align-items: center; gap: 4px; }
    .quantity { font-weight: bold; min-width: 30px; text-align: center; }
    .item-subtotal { min-width: 100px; text-align: right; }
    .subtotal-price { font-size: 18px; font-weight: bold; color: #1a73e8; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total { font-size: 20px; font-weight: bold; border-top: 2px solid #eee; padding-top: 16px; margin-top: 8px; }
    .checkout-btn { width: 100%; margin-top: 16px; }
    .text-center { text-align: center; }
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
    const userId = this.auth.userId;
    if (!userId) return;
    this.loading = true;
    this.api.placeOrder(userId).subscribe({
      next: (res) => {
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/orders', res.data.id]);
      },
      error: () => { this.loading = false; }
    });
  }
}
