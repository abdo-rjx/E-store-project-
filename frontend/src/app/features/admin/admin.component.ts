import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Category, Product } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="admin-page container">
      <div class="admin-header">
        <div class="admin-header-left">
          <h1>Product Management</h1>
          <p class="admin-subtitle">Create, update, and manage your product catalog.</p>
        </div>
        <button class="es-btn es-btn-primary" (click)="openAddDialog()">
          <span class="material-icons">add</span>
          Add Product
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="material-icons stat-icon">inventory_2</span>
          <div class="stat-info">
            <span class="stat-value">{{ products.length }}</span>
            <span class="stat-label">Total Products</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons stat-icon">check_circle</span>
          <div class="stat-info">
            <span class="stat-value">{{ inStockCount }}</span>
            <span class="stat-label">In Stock</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons stat-icon">warning</span>
          <div class="stat-info">
            <span class="stat-value">{{ outOfStockCount }}</span>
            <span class="stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of products; track p.id) {
                <tr>
                  <td>
                    <div class="product-cell">
                      <img [src]="p.imageUrl" [alt]="p.name" class="table-img"
                           onerror="this.src='https://placehold.co/40x40/1a1a2e/7C6FF7?text=E'">
                      <div class="product-cell-info">
                        <span class="product-cell-name">{{ p.name }}</span>
                        <span class="product-cell-id">ID: {{ p.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="category-pill">{{ p.categoryName }}</span>
                  </td>
                  <td class="price-cell">\${{ p.price | number:'1.2-2' }}</td>
                  <td>
                    <span class="stock-indicator" [class.low]="p.stock <= 5 && p.stock > 0"
                          [class.out]="p.stock === 0">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="action-btns">
                      <button class="es-btn-icon" (click)="openEditDialog(p)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="es-btn-icon delete-icon" (click)="deleteProduct(p)" title="Delete">
                        <span class="material-icons">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 20px 0; }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .admin-header h1 { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; letter-spacing: -0.03em; }
    .admin-subtitle { color: var(--text-secondary); font-size: 15px; margin-top: 6px; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
    }
    .stat-icon {
      font-size: 28px;
      color: var(--accent-primary);
      padding: 12px;
      background: var(--accent-primary-glow);
      border-radius: var(--radius-md);
    }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .stat-label { font-size: 12px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }
    .table-wrap { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
      padding: 14px 24px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);
    }
    .admin-table td {
      padding: 16px 24px;
      font-size: 14px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-primary);
      vertical-align: middle;
    }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tr:hover td { background: var(--bg-card-hover); }
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .table-img {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: var(--bg-secondary);
    }
    .product-cell-info { display: flex; flex-direction: column; }
    .product-cell-name { font-weight: 600; color: var(--text-primary); }
    .product-cell-id { font-size: 11px; color: var(--text-tertiary); }
    .category-pill {
      padding: 4px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }
    .price-cell { font-weight: 600; color: var(--text-primary); }
    .stock-indicator {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: var(--success-bg);
      color: var(--success);
    }
    .stock-indicator.low { background: var(--warning-bg); color: var(--warning); }
    .stock-indicator.out { background: var(--danger-bg); color: var(--danger); }
    .text-right { text-align: right; }
    .action-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .delete-icon:hover {
      color: var(--danger) !important;
      background: var(--danger-bg) !important;
      border-color: var(--danger) !important;
    }
  `]
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  get inStockCount(): number {
    return this.products.filter(p => p.stock > 0).length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (res) => { this.products = res.data; }
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => { this.categories = res.data; }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { product: { name: '', price: 0, stock: 0, categoryId: null, description: '', imageUrl: '' }, categories: this.categories }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { product: { ...product }, categories: this.categories }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete "${product.name}"?`)) {
      this.api.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to delete product', 'Close', { duration: 5000 });
        }
      });
    }
  }
}

@Component({
  selector: 'app-product-form-dialog',
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <h2>{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h2>
        <button class="es-btn-icon" (click)="dialogRef.close()">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="dialog-body">
        <div class="form-grid">
          <div class="es-input-group full-span">
            <label>Product Name</label>
            <input type="text" class="es-input" [(ngModel)]="form.name" placeholder="Enter product name">
          </div>
          <div class="es-input-group">
            <label>Price ($)</label>
            <input type="number" class="es-input" [(ngModel)]="form.price" placeholder="0.00">
          </div>
          <div class="es-input-group">
            <label>Stock</label>
            <input type="number" class="es-input" [(ngModel)]="form.stock" placeholder="0">
          </div>
          <div class="es-input-group">
            <label>Category</label>
            <div class="category-select-wrap">
              <select class="es-input" [(ngModel)]="form.categoryId">
                <option [ngValue]="null" disabled>Select a category</option>
                @for (cat of categories; track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
              <button type="button" class="es-btn-icon add-cat-btn" (click)="showNewCategoryInput = true" title="Create new category">
                <span class="material-icons">add</span>
              </button>
            </div>
            @if (showNewCategoryInput) {
              <div class="new-category-row">
                <input type="text" class="es-input" [(ngModel)]="newCategoryName" placeholder="New category name"
                       (keyup.enter)="createCategory()" (keyup.escape)="cancelNewCategory()">
                <button type="button" class="es-btn-icon confirm-cat-btn" (click)="createCategory()" [disabled]="!newCategoryName.trim()" title="Create">
                  <span class="material-icons">check</span>
                </button>
                <button type="button" class="es-btn-icon cancel-cat-btn" (click)="cancelNewCategory()" title="Cancel">
                  <span class="material-icons">close</span>
                </button>
              </div>
            }
          </div>
          <div class="es-input-group full-span">
            <label>Description</label>
            <textarea class="es-input" [(ngModel)]="form.description" rows="3"
                      placeholder="Product description..."></textarea>
          </div>

          <div class="upload-section full-span">
            <div class="upload-group">
              <label>Promotional Video</label>
              <div class="upload-area" [class.has-file]="videoPreview"
                   (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onVideoDrop($event)">
                <button class="upload-trigger-btn" (click)="videoInput.click()">
                  @if (!videoPreview) {
                    <span class="material-icons upload-icon">videocam</span>
                    <span class="upload-text">Choose Video</span>
                    <span class="upload-hint">MP4, WebM (max 50MB)</span>
                  } @else {
                    <div class="video-preview-wrap">
                      <video [src]="videoPreview" muted [muted]="true" class="video-preview"></video>
                      <button class="remove-btn" (click)="removeVideo()" type="button">
                        <span class="material-icons">close</span>
                      </button>
                    </div>
                  }
                </button>
                <input type="file" #videoInput hidden (change)="onVideoSelect($event)">
              </div>
            </div>

            <div class="upload-group">
              <label>Product Images (1-5)</label>
              <div class="upload-area images-area" [class.has-files]="imagePreviews.length > 0"
                   (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onImagesDrop($event)">
                <button class="upload-trigger-btn" (click)="imageInput.click()">
                  <span class="material-icons upload-icon">add_photo_alternate</span>
                  <span class="upload-text">Choose Images (1-5)</span>
                </button>
                @if (imagePreviews.length > 0) {
                  <div class="images-preview-grid">
                    @for (src of imagePreviews; track src; let i = $index) {
                      <div class="image-preview-item">
                        <img [src]="src" class="image-preview">
                        <button class="remove-btn" (click)="removeImage(i)" type="button">
                          <span class="material-icons">close</span>
                        </button>
                      </div>
                    }
                  </div>
                }
                <input type="file" #imageInput hidden multiple (change)="onImagesSelect($event)">
              </div>
              <span class="upload-counter">{{ imagePreviews.length }}/5 images</span>
            </div>
          </div>
        </div>

        @if (uploadError) {
          <div class="upload-error-msg">
            <span class="material-icons">error_outline</span>
            {{ uploadError }}
          </div>
        }
      </div>

      <div class="dialog-footer">
        <button class="es-btn es-btn-secondary" (click)="dialogRef.close()" [disabled]="saving">Cancel</button>
        <button class="es-btn es-btn-primary" (click)="save()" [disabled]="saving">
          @if (saving) {
            <span class="material-icons spinning">sync</span>
            Saving...
          } @else {
            <span class="material-icons">save</span>
            Save Product
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 24px; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .dialog-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .dialog-body { margin-bottom: 24px; max-height: 60vh; overflow-y: auto; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-span { grid-column: 1 / -1; }
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border-primary);
    }
    .upload-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-primary);
    }
    .upload-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: block;
    }
    .upload-area {
      border: 2px dashed var(--border-secondary);
      border-radius: var(--radius-md);
      padding: 24px;
      text-align: center;
      background: var(--bg-input);
    }
    .upload-area.has-file, .upload-area.has-files {
      border-style: solid;
      border-color: var(--accent-primary);
      padding: 12px;
    }
    .upload-trigger-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .upload-trigger-btn:hover {
      background: var(--accent-primary-glow);
    }
    .upload-trigger-btn .upload-icon { font-size: 36px; color: var(--accent-primary); }
    .upload-trigger-btn .upload-text { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
    .upload-trigger-btn .upload-hint { font-size: 12px; color: var(--text-tertiary); }
    .upload-area:hover, .upload-area.drag-over {
      border-color: var(--accent-primary);
      background: var(--accent-primary-glow);
    }
    .upload-area.has-file, .upload-area.has-files {
      border-style: solid;
      border-color: var(--accent-primary);
      padding: 12px;
    }
    .file-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .upload-icon { font-size: 40px; color: var(--accent-primary); }
    .upload-text { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
    .upload-hint { font-size: 12px; color: var(--text-tertiary); }
    .video-preview-wrap {
      position: relative;
      display: inline-block;
      max-width: 100%;
    }
    .video-preview { max-width: 100%; max-height: 200px; border-radius: var(--radius-sm); display: block; }
    .images-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .image-preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .image-preview { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(248, 113, 113, 0.9);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
    }
    .remove-btn .material-icons { font-size: 16px; }
    .upload-counter { font-size: 12px; color: var(--text-tertiary); margin-top: 8px; display: block; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .upload-error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      background: var(--danger-bg);
      border: 1px solid var(--danger);
      border-radius: var(--radius-md);
      color: var(--danger);
      font-size: 13px;
      font-weight: 500;
    }
    .upload-error-msg .material-icons { font-size: 18px; }
    .category-select-wrap { display: flex; gap: 8px; align-items: center; }
    .category-select-wrap select { flex: 1; }
    .add-cat-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-primary);
      background: var(--bg-card);
      color: var(--accent-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .add-cat-btn:hover {
      background: var(--accent-primary-glow);
      border-color: var(--accent-primary);
    }
    .new-category-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 8px;
    }
    .new-category-row input { flex: 1; }
    .confirm-cat-btn, .cancel-cat-btn {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .confirm-cat-btn {
      background: var(--accent-primary);
      color: #fff;
    }
    .confirm-cat-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .confirm-cat-btn:hover:not(:disabled) { opacity: 0.9; }
    .cancel-cat-btn {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-primary);
    }
    .cancel-cat-btn:hover { background: var(--danger-bg); color: var(--danger); border-color: var(--danger); }
    .es-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  imports: [CommonModule, MatDialogModule, FormsModule, MatSnackBarModule],
  standalone: true
})
export class ProductFormDialogComponent {
  isEdit = false;
  saving = false;
  form: any = {};
  categories: Category[] = [];
  uploadError: string | null = null;

  videoFile: File | null = null;
  videoPreview: string | null = null;
  imageFiles: File[] = [];
  imagePreviews: string[] = [];

  newCategoryName = '';
  showNewCategoryInput = false;

  private static readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  private static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = !!this.data.product.id;
    this.form = { ...this.data.product };
    this.categories = this.data.categories || [];
  }

  createCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.api.createCategory({ name }).subscribe({
      next: (res) => {
        this.categories.push(res.data);
        this.form.categoryId = res.data.id;
        this.newCategoryName = '';
        this.showNewCategoryInput = false;
        this.snackBar.open('Category created', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to create category', 'Close', { duration: 5000 });
      }
    });
  }

  cancelNewCategory(): void {
    this.newCategoryName = '';
    this.showNewCategoryInput = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  onVideoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setVideo(input.files[0]);
    }
  }

  onVideoDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.setVideo(event.dataTransfer.files[0]);
    }
  }

  setVideo(file: File) {
    this.uploadError = null;
    if (!file.type.startsWith('video/')) {
      this.uploadError = `File is not a video. Type: ${file.type}`;
      return;
    }
    if (file.size > ProductFormDialogComponent.MAX_VIDEO_SIZE) {
      this.uploadError = `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 50MB.`;
      return;
    }
    this.videoFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.videoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeVideo() {
    this.videoFile = null;
    this.videoPreview = null;
  }

  onImagesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addImages(Array.from(input.files));
    }
  }

  onImagesDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    if (event.dataTransfer?.files) {
      this.addImages(Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    }
  }

  addImages(files: File[]) {
    this.uploadError = null;
    const remaining = 5 - this.imageFiles.length;
    const toAdd = files.slice(0, remaining);
    for (const file of toAdd) {
      if (file.size > ProductFormDialogComponent.MAX_IMAGE_SIZE) {
        this.uploadError = `"${file.name}" too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB each.`;
        continue;
      }
      this.imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => { this.imagePreviews.push(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.imageFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  save(): void {
    this.uploadError = null;

    if (!this.form.name?.trim()) {
      this.uploadError = 'Product name is required.';
      return;
    }
    if (this.form.price == null || this.form.price <= 0) {
      this.uploadError = 'Valid price is required.';
      return;
    }
    if (!this.form.categoryId) {
      this.uploadError = 'Category ID is required.';
      return;
    }

    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.form.name.trim());
    formData.append('price', String(this.form.price));
    formData.append('description', this.form.description || '');
    formData.append('categoryId', String(this.form.categoryId));
    formData.append('stock', String(this.form.stock ?? 0));

    if (this.videoFile) {
      formData.append('video', this.videoFile, this.videoFile.name);
    }
    for (const file of this.imageFiles) {
      formData.append('images', file, file.name);
    }

    if (this.isEdit && this.form.id) {
      this.api.updateProductWithFiles(this.form.id, formData).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          const msg = this.extractError(err);
          this.uploadError = msg;
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        }
      });
    } else {
      this.api.uploadProduct(formData).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          const msg = this.extractError(err);
          this.uploadError = msg;
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        }
      });
    }
  }

  private extractError(err: any): string {
    if (err.status === 0) {
      return 'Cannot connect to server. Make sure the backend is running on port 8080.';
    }
    if (err.status === 401) {
      return 'Session expired. Please log in again.';
    }
    if (err.status === 403) {
      return 'Access denied. Admin role required.';
    }
    if (err.error?.message) {
      return err.error.message;
    }
    return `Upload failed (HTTP ${err.status}). Please try again.`;
  }
}
