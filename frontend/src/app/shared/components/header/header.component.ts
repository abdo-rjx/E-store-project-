import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary" class="header">
      <a routerLink="/products" mat-button>
        <mat-icon>storefront</mat-icon>
        E-Store
      </a>

      <span class="spacer"></span>

      <a routerLink="/products" mat-button routerLinkActive="active-link">
        <mat-icon>inventory_2</mat-icon>
        Catalog
      </a>

      @if (authService.isLoggedIn) {
        <a routerLink="/cart" mat-button routerLinkActive="active-link">
          <mat-icon>shopping_cart</mat-icon>
          Cart
        </a>
        <a routerLink="/orders" mat-button routerLinkActive="active-link">
          <mat-icon>receipt_long</mat-icon>
          Orders
        </a>
      }

      @if (authService.isAdmin) {
        <a routerLink="/admin" mat-button routerLinkActive="active-link">
          <mat-icon>admin_panel_settings</mat-icon>
          Admin
        </a>
      }

      @if (authService.isLoggedIn) {
        <button mat-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
          {{ authService.currentUser?.firstName }}
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            Profile
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      } @else {
        <a routerLink="/login" mat-button>
          <mat-icon>login</mat-icon>
          Login
        </a>
        <a routerLink="/register" mat-raised-button color="accent">
          Register
        </a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .header { padding: 0 16px; }
    .spacer { flex: 1 1 auto; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
