import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
    @if (!order) {
      <div class="order-loader">
        <div class="ghost ghost-bar"></div>
        <div class="ghost ghost-block"></div>
        <div class="ghost ghost-tall"></div>
      </div>
    } @else {
      <div class="order-detail-stage">
        <!-- Back -->
        <nav class="crumb">
          <a routerLink="/orders" class="crumb-link">
            <span class="material-icons">arrow_back</span>
            Back to Orders
          </a>
        </nav>

        <!-- Order Hero -->
        <div class="order-hero">
          <div class="hero-left">
            <span class="hero-label">Order</span>
            <h1 class="hero-id">#{{ order.id }}</h1>
            <div class="hero-meta">
              <span class="meta-piece">
                <span class="material-icons">calendar_today</span>
                {{ order.orderDate | date:'medium' }}
              </span>
              <span class="meta-piece">
                <span class="material-icons">email</span>
                {{ order.userEmail }}
              </span>
            </div>
          </div>
          <div class="hero-right">
            <span class="order-badge" [class.badge-confirmed]="order.status === 'CONFIRMED'">
              {{ order.status }}
            </span>
          </div>
        </div>

        <!-- Items Table -->
        <div class="items-panel">
          <h2 class="panel-heading">Order Items</h2>
          <div class="panel-scroll">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th class="cell-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of order.items; track item.id) {
                  <tr>
                    <td class="cell-product">
                      <span class="product-name">{{ item.productName }}</span>
                    </td>
                    <td>\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td>
                      <span class="qty-chip">×{{ item.quantity }}</span>
                    </td>
                    <td class="cell-right cell-subtotal">
                      \${{ item.subtotal | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="panel-total">
            <div class="total-line">
              <span>Total</span>
              <span class="total-value">\${{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    }
    </div>
  `,
  styles: [`
    .order-detail-stage { padding: 24px 0; }

    .crumb { margin-bottom: 28px; }

    .crumb-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s;
    }

    .crumb-link:hover { color: var(--accent-primary); }
    .crumb-link .material-icons { font-size: 18px; }

    /* Hero */
    .order-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .hero-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .hero-id {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 4px 0 12px;
    }

    .hero-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .meta-piece {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .meta-piece .material-icons { font-size: 16px; color: var(--text-tertiary); }

    .order-badge {
      padding: 8px 20px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .order-badge.badge-confirmed {
      background: var(--success-bg);
      color: var(--success);
      border-color: rgba(34, 197, 94, 0.2);
    }

    /* Panel */
    .items-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }

    .panel-heading {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      padding: 24px 24px 0;
      margin-bottom: 16px;
    }

    .panel-scroll { overflow-x: auto; }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }

    .detail-table th {
      padding: 12px 24px;
      text-align: left;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);
    }

    .detail-table td {
      padding: 16px 24px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-primary);
    }

    .detail-table tr:last-child td { border-bottom: none; }
    .detail-table tr:hover td { background: var(--bg-card-hover); }

    .product-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .qty-chip {
      display: inline-flex;
      padding: 3px 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-pill);
      font-size: 13px;
      font-weight: 600;
    }

    .cell-subtotal {
      font-weight: 600;
      color: var(--text-primary);
    }

    .cell-right { text-align: right; }

    .panel-total {
      padding: 20px 24px;
      border-top: 1px solid var(--border-primary);
      background: var(--bg-secondary);
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .total-value {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .order-loader { padding: 24px 0; }
    .ghost-bar { height: 40px; width: 200px; border-radius: var(--radius-sm); margin-bottom: 24px; }
    .ghost-block { height: 200px; border-radius: var(--radius-lg); margin-bottom: 16px; }
    .ghost-tall { height: 300px; border-radius: var(--radius-lg); }

    @media (max-width: 768px) {
      .detail-table th, .detail-table td { padding: 12px 16px; }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getOrder(id).subscribe({
      next: (res) => { this.order = res.data; },
      error: () => this.snackBar.open('Order not found', 'Close', { duration: 3000 })
    });
  }
}
