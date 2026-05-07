import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-stage">
      <div class="orders-prologue">
        <h1>My Orders</h1>
        <p class="orders-subtitle">Track and manage your purchases.</p>
      </div>

      @if (loading) {
        <div class="orders-feed">
          @for (i of [1,2,3]; track i) {
            <div class="ghost ghost-order"></div>
          }
        </div>
      } @else if (orders.length === 0) {
        <div class="orders-empty">
          <span class="material-icons empty-icon">receipt_long</span>
          <h3>No orders yet</h3>
          <p>Your order history will appear here once you make a purchase.</p>
          <a routerLink="/products" class="btn-shop">
            Start Shopping
            <span class="material-icons">arrow_forward</span>
          </a>
        </div>
      } @else {
        <div class="orders-feed">
          @for (order of orders; track order.id) {
            <a [routerLink]="['/orders', order.id]" class="order-entry">
              <div class="order-head">
                <div class="order-ref">
                  <span class="order-label">Order</span>
                  <span class="order-num">#{{ order.id }}</span>
                </div>
                <span class="order-status" [class.status-confirmed]="order.status === 'CONFIRMED'">
                  {{ order.status }}
                </span>
              </div>

              <div class="order-meta">
                <span class="meta-date">
                  <span class="material-icons">calendar_today</span>
                  {{ order.orderDate | date:'mediumDate' }}
                </span>
                <span class="meta-count">
                  <span class="material-icons">inventory_2</span>
                  {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                </span>
              </div>

              <div class="order-items-preview">
                @for (item of order.items.slice(0, 3); track item.id) {
                  <span class="item-pill">{{ item.productName }} ×{{ item.quantity }}</span>
                }
                @if (order.items.length > 3) {
                  <span class="item-pill item-pill-more">+{{ order.items.length - 3 }} more</span>
                }
              </div>

              <div class="order-foot">
                <span class="order-total">\${{ order.totalAmount | number:'1.2-2' }}</span>
                <span class="order-action">
                  View Details
                  <span class="material-icons">arrow_forward</span>
                </span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-stage { padding: 24px 0; }

    .orders-prologue { margin-bottom: 36px; }

    .orders-prologue h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .orders-subtitle {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      font-size: 15px;
      margin-top: 6px;
    }

    .orders-feed {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ghost-order { height: 160px; border-radius: var(--radius-lg); }

    .order-entry {
      display: block;
      padding: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .order-entry:hover {
      border-color: var(--border-accent);
      box-shadow: var(--shadow-float);
      transform: translateY(-2px);
    }

    .order-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .order-ref { display: flex; align-items: baseline; gap: 8px; }

    .order-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      font-weight: 500;
    }

    .order-num {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
    }

    .order-status {
      font-family: 'DM Sans', sans-serif;
      padding: 5px 14px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .order-status.status-confirmed {
      background: var(--success-bg);
      color: var(--success);
      border-color: rgba(34, 197, 94, 0.2);
    }

    .order-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .meta-date, .meta-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .meta-date .material-icons,
    .meta-count .material-icons { font-size: 16px; }

    .order-items-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .item-pill {
      padding: 5px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .item-pill-more {
      background: var(--accent-primary-glow);
      color: var(--accent-primary);
      border-color: var(--border-accent);
    }

    .order-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-primary);
    }

    .order-total {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .order-action {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent-primary);
      transition: gap 0.3s;
    }

    .order-entry:hover .order-action { gap: 8px; }
    .order-action .material-icons { font-size: 16px; }

    .orders-empty { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 68px; color: var(--text-tertiary); margin-bottom: 16px; }
    .orders-empty h3 { font-family: 'DM Sans', sans-serif; margin-bottom: 8px; }
    .orders-empty p {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .btn-shop {
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

    .btn-shop:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-shop .material-icons { font-size: 18px; }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.api.getUserOrders(userId).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
