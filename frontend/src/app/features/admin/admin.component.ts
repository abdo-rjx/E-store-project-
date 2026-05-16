import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Category, Product } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="admin-page container">

      <!-- ── Header ── -->
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Inventory</h1>
          <p class="admin-sub">{{ totalElements | number }} products · manage stock, pricing &amp; catalog</p>
        </div>
        <div class="header-actions">
          <button class="es-btn es-btn-outline" (click)="triggerImport()" [disabled]="importing" title="Import CSV">
            <span class="material-icons">upload_file</span>
            {{ importing ? 'Importing…' : 'Import CSV' }}
          </button>
          <button class="es-btn es-btn-outline" (click)="exportCsv()" [disabled]="exporting" title="Export CSV">
            <span class="material-icons">download</span>
            {{ exporting ? 'Exporting…' : 'Export CSV' }}
          </button>
          <button class="es-btn es-btn-primary" (click)="openAddDialog()">
            <span class="material-icons">add</span>
            Add Product
          </button>
          <input #csvInput type="file" accept=".csv" hidden (change)="onCsvFile($event)">
        </div>
      </div>

      <!-- ── Stats ── -->
      <div class="stats-row">
        <div class="stat-card" (click)="setStockFilter('all')" [class.active]="stockFilter==='all'">
          <span class="stat-value">{{ totalElements | number }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card" (click)="setStockFilter('inStock')" [class.active]="stockFilter==='inStock'">
          <span class="stat-value">{{ inStockCount | number }}</span>
          <span class="stat-label">In Stock</span>
        </div>
        <div class="stat-card warn" (click)="setStockFilter('lowStock')" [class.active]="stockFilter==='lowStock'">
          <span class="stat-value">{{ lowStockCount | number }}</span>
          <span class="stat-label">Low Stock (≤5)</span>
        </div>
        <div class="stat-card danger" (click)="setStockFilter('outOfStock')" [class.active]="stockFilter==='outOfStock'">
          <span class="stat-value">{{ outOfStockCount | number }}</span>
          <span class="stat-label">Out of Stock</span>
        </div>
      </div>

      <!-- ── Import result ── -->
      @if (importResult) {
        <div class="import-banner" [class.has-errors]="importResult.errors?.length">
          <span class="material-icons">{{ importResult.errors?.length ? 'warning' : 'check_circle' }}</span>
          <span><strong>{{ importResult.updated }}</strong> updated · <strong>{{ importResult.skipped }}</strong> skipped</span>
          @if (importResult.errors?.length) {
            <span class="import-errors">{{ importResult.errors[0] }}{{ importResult.errors.length > 1 ? ' +' + (importResult.errors.length - 1) + ' more' : '' }}</span>
          }
          <button class="import-close" (click)="importResult = null">
            <span class="material-icons">close</span>
          </button>
        </div>
      }

      <!-- ── Toolbar ── -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="material-icons search-icon">search</span>
          <input class="search-input" type="text" placeholder="Search products…"
                 [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
          @if (searchQuery) {
            <button class="search-clear" (click)="clearSearch()">
              <span class="material-icons">close</span>
            </button>
          }
        </div>

        <select class="filter-select" [(ngModel)]="selectedCategoryId" (ngModelChange)="applyFilters()">
          <option [ngValue]="null">All Categories</option>
          @for (cat of categories; track cat.id) {
            <option [ngValue]="cat.id">{{ cat.name }}</option>
          }
        </select>

        <select class="filter-select" [(ngModel)]="stockFilter" (ngModelChange)="applyFilters()">
          <option value="all">All Stock</option>
          <option value="inStock">In Stock</option>
          <option value="lowStock">Low Stock (≤5)</option>
          <option value="outOfStock">Out of Stock</option>
        </select>

        <select class="filter-select size-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
          <option [ngValue]="25">25 / page</option>
          <option [ngValue]="50">50 / page</option>
          <option [ngValue]="100">100 / page</option>
        </select>
      </div>

      <!-- ── Table ── -->
      <div class="table-card">
        @if (loading) {
          <div class="table-loading">
            <span class="material-icons spinning">sync</span>
            Loading…
          </div>
        }
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="col-id" (click)="toggleSort('id')">
                  ID <span class="sort-icon">{{ sortIcon('id') }}</span>
                </th>
                <th (click)="toggleSort('name')">
                  Product <span class="sort-icon">{{ sortIcon('name') }}</span>
                </th>
                <th>Category</th>
                <th (click)="toggleSort('price')">
                  Price <span class="sort-icon">{{ sortIcon('price') }}</span>
                </th>
                <th (click)="toggleSort('stock')">
                  Stock <span class="sort-icon">{{ sortIcon('stock') }}</span>
                </th>
                <th class="col-star" title="Featured">★</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (products.length === 0 && !loading) {
                <tr>
                  <td colspan="7" class="empty-state">
                    <span class="material-icons">inventory_2</span>
                    <span>No products found</span>
                  </td>
                </tr>
              }
              @for (p of products; track p.id) {
                <tr>
                  <td class="col-id text-muted">#{{ p.id }}</td>
                  <td>
                    <div class="product-cell">
                      <img [src]="p.imageUrl || (p.imagePaths?.[0])" [alt]="p.name" class="table-img"
                           onerror="this.src='https://placehold.co/40x40/1C1C1C/C8102E?text=E'">
                      <div>
                        <div class="product-name">{{ p.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="cat-tag">{{ p.categoryName }}</span>
                  </td>
                  <td class="price-cell">\${{ p.price | number:'1.2-2' }}</td>
                  <td class="stock-cell" (click)="startEditStock(p)" title="Click to edit">
                    @if (editingStockId === p.id) {
                      <input class="stock-input" type="number" min="0"
                             [(ngModel)]="editingStockValue"
                             (blur)="saveStock(p.id)"
                             (keyup.enter)="saveStock(p.id)"
                             (keyup.escape)="cancelEditStock()"
                             (click)="$event.stopPropagation()"
                             #stockInputRef>
                    } @else {
                      <span class="stock-badge"
                            [class.low]="p.stock > 0 && p.stock <= 5"
                            [class.out]="p.stock === 0">
                        {{ p.stock }}
                        <span class="edit-hint material-icons">edit</span>
                      </span>
                    }
                  </td>
                  <td class="col-star">
                    <button class="star-btn" [class.starred]="p.featured" (click)="toggleFeatured(p)" [title]="p.featured ? 'Unfeature product' : 'Feature this product'">
                      {{ p.featured ? '★' : '☆' }}
                    </button>
                  </td>
                  <td class="col-actions">
                    <div class="action-btns">
                      <button class="icon-btn" (click)="openEditDialog(p)" title="Edit">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="icon-btn danger-btn" (click)="deleteProduct(p)" title="Delete">
                        <span class="material-icons">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ── Pagination ── -->
        @if (totalPages > 1) {
          <div class="pagination">
            <span class="page-info">
              {{ currentPage * pageSize + 1 }}–{{ min((currentPage + 1) * pageSize, totalElements) }}
              of {{ totalElements | number }}
            </span>
            <div class="page-controls">
              <button class="page-btn" [disabled]="currentPage === 0" (click)="goToPage(0)">
                <span class="material-icons">first_page</span>
              </button>
              <button class="page-btn" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
                <span class="material-icons">chevron_left</span>
              </button>

              @for (p of pageNumbers(); track p) {
                <button class="page-btn page-num"
                        [class.active]="p === currentPage"
                        (click)="goToPage(p)">{{ p + 1 }}</button>
              }

              <button class="page-btn" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">
                <span class="material-icons">chevron_right</span>
              </button>
              <button class="page-btn" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(totalPages - 1)">
                <span class="material-icons">last_page</span>
              </button>
            </div>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .admin-page { padding: 32px 0 80px; }

    /* ── Header ── */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .admin-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-primary);
    }
    .admin-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      margin-top: 4px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* ── Stats ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: var(--border);
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 20px 24px;
      background: var(--bg-2);
      cursor: pointer;
      transition: background 0.18s;
      border-left: 2px solid transparent;
    }
    .stat-card:hover, .stat-card.active { background: var(--bg-3); }
    .stat-card.active { border-left-color: var(--accent); }
    .stat-card.warn.active { border-left-color: var(--warning); }
    .stat-card.danger.active { border-left-color: var(--danger); }
    .stat-value {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }
    .stat-card.warn .stat-value { color: var(--warning); }
    .stat-card.danger .stat-value { color: var(--danger); }
    .stat-label {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── Import banner ── */
    .import-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--success-bg);
      border: 1px solid var(--success);
      margin-bottom: 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--success);
    }
    .import-banner.has-errors {
      background: var(--warning-bg);
      border-color: var(--warning);
      color: var(--warning);
    }
    .import-banner .material-icons { font-size: 18px; }
    .import-errors { opacity: 0.7; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .import-close { background: none; border: none; cursor: pointer; color: inherit; display: flex; align-items: center; margin-left: auto; }
    .import-close .material-icons { font-size: 16px; }

    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0;
      flex-wrap: wrap;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 220px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--text-tertiary);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 9px 36px 9px 38px;
      background: var(--bg-2);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.18s;
    }
    .search-input:focus { border-color: var(--accent-border); }
    .search-clear {
      position: absolute;
      right: 8px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--text-tertiary); display: flex; align-items: center;
    }
    .search-clear:hover { color: var(--accent); }
    .search-clear .material-icons { font-size: 16px; }
    .filter-select {
      padding: 9px 12px;
      background: var(--bg-2);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      cursor: pointer;
      outline: none;
      min-width: 140px;
    }
    .filter-select:focus { border-color: var(--accent-border); }
    .size-select { min-width: 110px; }

    /* ── Table ── */
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }
    .table-loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: rgba(13,13,13,0.7);
      z-index: 10;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }
    .table-wrap { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
      padding: 12px 20px;
      text-align: left;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: var(--bg-1);
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
    }
    .admin-table th:hover { color: var(--text-primary); }
    .sort-icon { font-size: 10px; opacity: 0.5; }
    .admin-table td {
      padding: 13px 20px;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tbody tr:hover td { background: var(--bg-2); }
    .col-id { width: 60px; }
    .col-star { width: 44px; text-align: center; cursor: default; }
    .col-actions { width: 90px; }

    .star-btn {
      background: none;
      border: none;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      color: var(--text-tertiary);
      transition: color 0.15s, transform 0.15s;
      padding: 2px 4px;
    }
    .star-btn:hover { color: #f5c842; transform: scale(1.2); }
    .star-btn.starred { color: #f5c842; }
    .text-muted { color: var(--text-tertiary); font-size: 12px; }

    .product-cell { display: flex; align-items: center; gap: 12px; }
    .table-img {
      width: 36px; height: 36px;
      object-fit: cover;
      background: var(--bg-2);
      flex-shrink: 0;
    }
    .product-name { font-weight: 500; color: var(--text-primary); }

    .cat-tag {
      padding: 3px 10px;
      background: var(--bg-3);
      border: 1px solid var(--border);
      font-size: 11px;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .price-cell { font-weight: 600; color: var(--text-primary); white-space: nowrap; }

    /* ── Stock inline edit ── */
    .stock-cell { cursor: pointer; }
    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid transparent;
    }
    .stock-badge.low { background: var(--warning-bg); color: var(--warning); }
    .stock-badge.out { background: var(--danger-bg); color: var(--danger); }
    .edit-hint {
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .stock-cell:hover .edit-hint { opacity: 0.6; }
    .stock-input {
      width: 72px;
      padding: 4px 8px;
      background: var(--bg-1);
      border: 1px solid var(--accent-border);
      color: var(--text-primary);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 14px;
      font-weight: 700;
      outline: none;
    }

    /* ── Empty state ── */
    .empty-state {
      text-align: center;
      padding: 60px 20px !important;
      color: var(--text-tertiary);
    }
    .empty-state .material-icons { font-size: 40px; display: block; margin-bottom: 8px; }

    /* ── Pagination ── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      background: var(--bg-1);
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-info {
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }
    .page-controls { display: flex; align-items: center; gap: 4px; }
    .page-btn {
      width: 32px; height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 600;
    }
    .page-btn:hover:not(:disabled) { border-color: var(--accent-border); color: var(--accent); }
    .page-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-btn .material-icons { font-size: 16px; }

    /* ── Buttons ── */
    .es-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 9px 18px;
      border: none;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: background 0.18s, box-shadow 0.18s;
    }
    .es-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .es-btn .material-icons { font-size: 17px; }
    .es-btn-primary { background: var(--accent); color: #fff; }
    .es-btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .es-btn-outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .es-btn-outline:hover:not(:disabled) {
      border-color: var(--accent-border);
      color: var(--accent);
      background: var(--accent-dim);
    }
    .icon-btn {
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: 1px solid var(--border);
      color: var(--text-tertiary); cursor: pointer; transition: all 0.15s;
    }
    .icon-btn:hover { border-color: var(--accent-border); color: var(--accent); }
    .danger-btn:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-bg); }
    .icon-btn .material-icons { font-size: 15px; }
    .action-btns { display: flex; gap: 6px; }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .filter-select, .search-wrap { width: 100%; }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];

  // Filters & sort
  searchQuery = '';
  selectedCategoryId: number | null = null;
  stockFilter: 'all' | 'inStock' | 'lowStock' | 'outOfStock' = 'all';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;

  // Stats (from current totals queries)
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  // UI state
  loading = false;
  editingStockId: number | null = null;
  editingStockValue = 0;
  importing = false;
  exporting = false;
  importResult: { updated: number; skipped: number; errors: string[] } | null = null;

  @ViewChild('csvInput') csvInputRef!: ElementRef<HTMLInputElement>;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadStatsCounters();
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    const kw = this.searchQuery.trim() || undefined;
    const catId = this.selectedCategoryId ?? undefined;
    this.api.getAdminProducts(this.currentPage, this.pageSize, kw, catId, this.stockFilter, this.sortBy, this.sortDir)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => {
          this.products = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        },
        error: () => this.snackBar.open('Failed to load products', 'Close', { duration: 3000 })
      });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({ next: res => this.categories = res.data });
  }

  loadStatsCounters(): void {
    this.api.getAdminProducts(0, 1, undefined, undefined, 'inStock', 'id', 'asc')
      .subscribe(res => this.inStockCount = res.data.totalElements);
    this.api.getAdminProducts(0, 1, undefined, undefined, 'lowStock', 'id', 'asc')
      .subscribe(res => this.lowStockCount = res.data.totalElements);
    this.api.getAdminProducts(0, 1, undefined, undefined, 'outOfStock', 'id', 'asc')
      .subscribe(res => this.outOfStockCount = res.data.totalElements);
  }

  onSearchChange(val: string): void { this.searchSubject.next(val); }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  setStockFilter(f: 'all' | 'inStock' | 'lowStock' | 'outOfStock'): void {
    this.stockFilter = f;
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.loadProducts();
  }

  sortIcon(field: string): string {
    if (this.sortBy !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  pageNumbers(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(0, cur - delta); i <= Math.min(total - 1, cur + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  // ── Inline stock editing ──
  startEditStock(product: Product): void {
    this.editingStockId = product.id;
    this.editingStockValue = product.stock;
    setTimeout(() => {
      const el = document.querySelector('.stock-input') as HTMLInputElement;
      if (el) { el.focus(); el.select(); }
    }, 30);
  }

  saveStock(productId: number): void {
    if (this.editingStockId !== productId) return;
    const value = Math.max(0, Math.floor(this.editingStockValue));
    this.editingStockId = null;
    const product = this.products.find(p => p.id === productId);
    if (!product || product.stock === value) return;

    const oldStock = product.stock;
    product.stock = value;

    this.api.updateStock(productId, value).subscribe({
      next: () => {
        this.snackBar.open(`Stock updated to ${value}`, 'Close', { duration: 2000 });
        this.loadStatsCounters();
      },
      error: () => {
        product.stock = oldStock;
        this.snackBar.open('Failed to update stock', 'Close', { duration: 3000 });
      }
    });
  }

  cancelEditStock(): void { this.editingStockId = null; }

  // ── CSV Export ──
  exportCsv(): void {
    this.exporting = true;
    this.api.exportProductsCsv().pipe(finalize(() => this.exporting = false)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Export failed', 'Close', { duration: 3000 })
    });
  }

  // ── CSV Import ──
  triggerImport(): void {
    this.csvInputRef.nativeElement.value = '';
    this.csvInputRef.nativeElement.click();
  }

  onCsvFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importing = true;
    this.importResult = null;
    this.api.importProductsCsv(file).pipe(finalize(() => this.importing = false)).subscribe({
      next: (res) => {
        this.importResult = res.data;
        this.loadProducts();
        this.loadStatsCounters();
      },
      error: () => this.snackBar.open('Import failed', 'Close', { duration: 4000 })
    });
  }

  // ── Featured toggle ──
  toggleFeatured(product: Product): void {
    const prev = product.featured;
    product.featured = !prev;
    this.api.toggleFeatured(product.id).subscribe({
      next: res => {
        product.featured = res.data.featured;
        const msg = product.featured ? `"${product.name}" marked as featured` : `"${product.name}" unfeatured`;
        this.snackBar.open(msg, 'Close', { duration: 2500 });
      },
      error: () => {
        product.featured = prev;
        this.snackBar.open('Failed to update featured status', 'Close', { duration: 3000 });
      }
    });
  }

  // ── Dialog actions ──
  openAddDialog(): void {
    this.dialog.open(ProductFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { product: { name: '', price: 0, stock: 0, categoryId: null, description: '', imageUrl: '' }, categories: this.categories }
    }).afterClosed().subscribe(result => {
      if (result) { this.loadProducts(); this.loadStatsCounters(); }
    });
  }

  openEditDialog(product: Product): void {
    this.dialog.open(ProductFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { product: { ...product }, categories: this.categories }
    }).afterClosed().subscribe(result => {
      if (result) { this.loadProducts(); }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
        this.loadProducts();
        this.loadStatsCounters();
      },
      error: err => this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 4000 })
    });
  }
}

// ════════════════════════════════════════════════════════════
//  ProductFormDialogComponent — unchanged from original
// ════════════════════════════════════════════════════════════
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
    .dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .dialog-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .dialog-body { margin-bottom: 24px; max-height: 60vh; overflow-y: auto; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-span { grid-column: 1 / -1; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border-primary); }
    .upload-section { display: flex; flex-direction: column; gap: 20px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-primary); }
    .upload-group label { font-size: 13px; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 8px; display: block; }
    .upload-area { border: 2px dashed var(--border-secondary); border-radius: var(--radius-md); padding: 24px; text-align: center; background: var(--bg-input); }
    .upload-area.has-file, .upload-area.has-files { border-style: solid; border-color: var(--accent-primary); padding: 12px; }
    .upload-trigger-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; padding: 20px; border: none; background: transparent; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .upload-trigger-btn:hover { background: var(--accent-primary-glow); }
    .upload-trigger-btn .upload-icon { font-size: 36px; color: var(--accent-primary); }
    .upload-trigger-btn .upload-text { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
    .upload-trigger-btn .upload-hint { font-size: 12px; color: var(--text-tertiary); }
    .upload-area:hover, .upload-area.drag-over { border-color: var(--accent-primary); background: var(--accent-primary-glow); }
    .video-preview-wrap { position: relative; display: inline-block; max-width: 100%; }
    .video-preview { max-width: 100%; max-height: 200px; border-radius: var(--radius-sm); display: block; }
    .images-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; margin-top: 12px; }
    .image-preview-item { position: relative; aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; }
    .image-preview { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(248,113,113,0.9); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
    .remove-btn .material-icons { font-size: 16px; }
    .upload-counter { font-size: 12px; color: var(--text-tertiary); margin-top: 8px; display: block; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .upload-error-msg { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px 16px; background: var(--danger-bg); border: 1px solid var(--danger); border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 500; }
    .upload-error-msg .material-icons { font-size: 18px; }
    .category-select-wrap { display: flex; gap: 8px; align-items: center; }
    .category-select-wrap select { flex: 1; }
    .add-cat-btn { flex-shrink: 0; width: 36px; height: 36px; border-radius: var(--radius-sm); border: 1px solid var(--border-primary); background: var(--bg-card); color: var(--accent-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .add-cat-btn:hover { background: var(--accent-primary-glow); border-color: var(--accent-primary); }
    .new-category-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
    .new-category-row input { flex: 1; }
    .confirm-cat-btn, .cancel-cat-btn { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .confirm-cat-btn { background: var(--accent-primary); color: #fff; }
    .confirm-cat-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .confirm-cat-btn:hover:not(:disabled) { opacity: 0.9; }
    .cancel-cat-btn { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-primary); }
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

  cancelNewCategory(): void { this.newCategoryName = ''; this.showNewCategoryInput = false; }

  onDragOver(event: DragEvent) { event.preventDefault(); event.stopPropagation(); (event.currentTarget as HTMLElement).classList.add('drag-over'); }
  onDragLeave(event: DragEvent) { event.preventDefault(); event.stopPropagation(); (event.currentTarget as HTMLElement).classList.remove('drag-over'); }

  onVideoSelect(event: Event) { const input = event.target as HTMLInputElement; if (input.files?.[0]) this.setVideo(input.files[0]); }

  onVideoDrop(event: DragEvent) {
    event.preventDefault(); event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    if (event.dataTransfer?.files?.[0]) this.setVideo(event.dataTransfer.files[0]);
  }

  setVideo(file: File) {
    this.uploadError = null;
    if (!file.type.startsWith('video/')) { this.uploadError = `File is not a video. Type: ${file.type}`; return; }
    if (file.size > ProductFormDialogComponent.MAX_VIDEO_SIZE) { this.uploadError = `Video too large (${(file.size/1024/1024).toFixed(1)}MB). Max 50MB.`; return; }
    this.videoFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.videoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeVideo() { this.videoFile = null; this.videoPreview = null; }

  onImagesSelect(event: Event) { const input = event.target as HTMLInputElement; if (input.files) this.addImages(Array.from(input.files)); }

  onImagesDrop(event: DragEvent) {
    event.preventDefault(); event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    if (event.dataTransfer?.files) this.addImages(Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/')));
  }

  addImages(files: File[]) {
    this.uploadError = null;
    const remaining = 5 - this.imageFiles.length;
    for (const file of files.slice(0, remaining)) {
      if (file.size > ProductFormDialogComponent.MAX_IMAGE_SIZE) { this.uploadError = `"${file.name}" too large. Max 5MB.`; continue; }
      this.imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => { this.imagePreviews.push(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) { this.imageFiles.splice(index, 1); this.imagePreviews.splice(index, 1); }

  save(): void {
    this.uploadError = null;
    if (!this.form.name?.trim()) { this.uploadError = 'Product name is required.'; return; }
    if (this.form.price == null || this.form.price <= 0) { this.uploadError = 'Valid price is required.'; return; }
    if (!this.form.categoryId) { this.uploadError = 'Category is required.'; return; }
    this.saving = true;
    const formData = new FormData();
    formData.append('name', this.form.name.trim());
    formData.append('price', String(this.form.price));
    formData.append('description', this.form.description || '');
    formData.append('categoryId', String(this.form.categoryId));
    formData.append('stock', String(this.form.stock ?? 0));
    if (this.videoFile) formData.append('video', this.videoFile, this.videoFile.name);
    for (const file of this.imageFiles) formData.append('images', file, file.name);

    const req = this.isEdit && this.form.id
      ? this.api.updateProductWithFiles(this.form.id, formData)
      : this.api.uploadProduct(formData);

    req.pipe(finalize(() => this.saving = false)).subscribe({
      next: res => { this.snackBar.open(res.message, 'Close', { duration: 3000 }); this.dialogRef.close(res.data); },
      error: err => { const msg = this.extractError(err); this.uploadError = msg; this.snackBar.open(msg, 'Close', { duration: 6000 }); }
    });
  }

  private extractError(err: any): string {
    if (err.status === 0) return 'Cannot connect to server. Make sure the backend is running on port 8080.';
    if (err.status === 401) return 'Session expired. Please log in again.';
    if (err.status === 403) return 'Access denied. Admin role required.';
    if (err.error?.message) return err.error.message;
    return `Upload failed (HTTP ${err.status}). Please try again.`;
  }
}
