import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, PageResponse } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatPaginatorModule, ProductCardComponent],
  template: `
    <div class="catalog-header">
      <h1>Product Catalog</h1>
      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search products</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search...">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="onSearch()">
            <mat-option [value]="null">All Categories</mat-option>
            @for (cat of categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading) {
      <p class="text-center">Loading products...</p>
    } @else if (products.length === 0) {
      <p class="text-center">No products found.</p>
    } @else {
      <div class="product-grid">
        @for (product of products; track product.id) {
          <app-product-card [product]="product"></app-product-card>
        }
      </div>

      @if (pageResponse) {
        <mat-paginator
          [length]="pageResponse.totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[6, 12, 24]"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          class="paginator">
        </mat-paginator>
      }
    }
  `,
  styles: [`
    .catalog-header { padding: 16px 0; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
    .search-field { min-width: 250px; }
    .paginator { margin-top: 16px; background: transparent; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory: number | null = null;
  loading = true;

  pageResponse: PageResponse<Product> | null = null;
  currentPage = 0;
  pageSize = 12;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => { this.categories = res.data; },
      error: () => this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 })
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProductsPaginated(this.currentPage, this.pageSize, this.searchTerm || undefined, this.selectedCategory || undefined).subscribe({
      next: (res) => {
        this.pageResponse = res.data;
        this.products = res.data.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }
}
