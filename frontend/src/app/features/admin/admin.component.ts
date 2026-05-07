import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule],
  template: `
    <h1>Admin Panel - Manage Products</h1>

    <mat-card>
      <mat-card-header>
        <mat-card-title>Products</mat-card-title>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Product
        </button>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="products" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let p"> {{ p.name }} </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef> Category </th>
            <td mat-cell *matCellDef="let p"> {{ p.categoryName }} </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Price </th>
            <td mat-cell *matCellDef="let p"> {{ '$' + (p.price | number:'1.2-2') }} </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Stock </th>
            <td mat-cell *matCellDef="let p"> {{ p.stock }} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button (click)="openEditDialog(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(p)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width-table { width: 100%; }
    mat-card-header { display: flex; justify-content: space-between; margin-bottom: 16px; }
  `]
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['name', 'category', 'price', 'stock', 'actions'];

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (res) => { this.products = res.data; }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product: { name: '', price: 0, stock: 0, categoryId: 1 } }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.createProduct(result).subscribe({
          next: () => {
            this.snackBar.open('Product created', 'Close', { duration: 3000 });
            this.loadProducts();
          }
        });
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product: { ...product } }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.updateProduct(product.id, result).subscribe({
          next: () => {
            this.snackBar.open('Product updated', 'Close', { duration: 3000 });
            this.loadProducts();
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete "${product.name}"?`)) {
      this.api.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
          this.loadProducts();
        }
      });
    }
  }
}

@Component({
  selector: 'app-product-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Product' : 'Add Product' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.product.name">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Price</mat-label>
        <input matInput type="number" [(ngModel)]="data.product.price">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Stock</mat-label>
        <input matInput type="number" [(ngModel)]="data.product.stock">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Category ID</mat-label>
        <input matInput type="number" [(ngModel)]="data.product.categoryId">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="data.product.description" rows="3"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Image URL</mat-label>
        <input matInput [(ngModel)]="data.product.imageUrl">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; }`],
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule]
})
export class ProductFormDialogComponent {
  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!this.data.product.id;
  }

  save(): void {
    this.dialogRef.close(this.data.product);
  }
}
