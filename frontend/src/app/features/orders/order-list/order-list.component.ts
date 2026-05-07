import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <h1>My Orders</h1>

    @if (loading) {
      <p class="text-center">Loading orders...</p>
    } @else if (orders.length === 0) {
      <mat-card>
        <mat-card-content class="text-center">
          <mat-icon class="large-icon">receipt_long</mat-icon>
          <p>No orders yet</p>
          <a routerLink="/products" mat-raised-button color="primary">Start Shopping</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <div class="orders-list">
        @for (order of orders; track order.id) {
          <mat-card class="order-card" [routerLink]="['/orders', order.id]">
            <mat-card-content>
              <div class="order-header">
                <div>
                  <h3>Order #{{ order.id }}</h3>
                  <p class="date">{{ order.orderDate | date:'medium' }}</p>
                </div>
                <div class="order-right">
                  <mat-chip [color]="order.status === 'CONFIRMED' ? 'primary' : 'warn'" selected>
                    {{ order.status }}
                  </mat-chip>
                  <p class="total">{{ '$' + (order.totalAmount | number:'1.2-2') }}</p>
                </div>
              </div>
              <div class="order-items">
                @for (item of order.items; track item.id) {
                  <span class="item-summary">{{ item.productName }} (x{{ item.quantity }})</span>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { cursor: pointer; transition: box-shadow 0.2s; }
    .order-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .order-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .date { color: #666; font-size: 14px; }
    .total { font-size: 20px; font-weight: bold; color: #1a73e8; }
    .order-items { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
    .item-summary { background: #f5f5f5; padding: 4px 12px; border-radius: 16px; font-size: 13px; }
    .text-center { text-align: center; padding: 40px; }
    .large-icon { font-size: 64px; height: 64px; width: 64px; color: #666; }
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
