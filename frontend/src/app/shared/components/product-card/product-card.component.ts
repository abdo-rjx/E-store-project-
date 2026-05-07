import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="product-card">
      <img [src]="product.imageUrl" [alt]="product.name" class="product-image"
           onerror="this.src='https://placehold.co/300x200?text=No+Image'">
      <mat-card-content>
        <mat-card-title>{{ product.name }}</mat-card-title>
        <div class="category">{{ product.categoryName }}</div>
        <div class="price">{{ '$' + (product.price | number:'1.2-2') }}</div>
        <div class="stock" [class.out-of-stock]="product.stock === 0">
          {{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}
        </div>
      </mat-card-content>
      <mat-card-actions>
        <a [routerLink]="['/products', product.id]" mat-button color="primary">
          <mat-icon>visibility</mat-icon>
          Details
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .category {
      color: #666;
      font-size: 12px;
      margin: 4px 0;
    }
    .price {
      font-size: 20px;
      font-weight: bold;
      color: #1a73e8;
      margin: 8px 0;
    }
    .stock {
      font-size: 12px;
      color: #4caf50;
    }
    .out-of-stock {
      color: #f44336;
    }
    mat-card-actions {
      margin-top: auto;
      justify-content: flex-end;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
}
