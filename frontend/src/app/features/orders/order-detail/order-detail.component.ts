import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule],
  template: `
    @if (order) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>Order #{{ order.id }}</mat-card-title>
          <mat-card-subtitle>{{ order.orderDate | date:'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="order-info">
            <div class="info-row">
              <strong>Status:</strong>
              <span class="status-badge status-{{ order.status.toLowerCase() }}">{{ order.status }}</span>
            </div>
            <div class="info-row">
              <strong>Total:</strong>
              <span class="total">{{ '$' + (order.totalAmount | number:'1.2-2') }}</span>
            </div>
          </div>

          <mat-divider class="my-2"></mat-divider>

          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order.items; track item.id) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ '$' + (item.unitPrice | number:'1.2-2') }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ '$' + (item.subtotal | number:'1.2-2') }}</td>
                </tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    } @else {
      <p class="text-center">Loading order details...</p>
    }
  `,
  styles: [`
    .order-info { display: flex; gap: 32px; flex-wrap: wrap; margin-top: 16px; }
    .info-row { display: flex; gap: 8px; }
    .status-badge { padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .total { font-size: 20px; font-weight: bold; color: #1a73e8; }
    .my-2 { margin: 16px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .items-table th { background: #f5f5f5; font-weight: 500; }
    .text-center { text-align: center; padding: 40px; }
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
