import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ClickOutsideDirective],
  template: `
    <header class="navbar" [class.scrolled]="isScrolled" [class.nav-open]="mobileMenuOpen">
      <div class="navbar-inner">

        <!-- Brand -->
        <a routerLink="/" class="nav-brand" (click)="navigateHome($event)">
          <div class="brand-mark">
            <span class="brand-mark-e">E</span>
          </div>
          <span class="brand-text">ESTORÉ</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="nav-links">
          <a routerLink="/products" routerLinkActive="nav-active"
             [routerLinkActiveOptions]="{exact:true}" class="nav-link">Shop</a>
          <a routerLink="/categories" routerLinkActive="nav-active" class="nav-link">Categories</a>

          @if (authService.isLoggedIn) {
            <a routerLink="/cart" routerLinkActive="nav-active" class="nav-link cart-link">
              Cart
              @if (cartCount > 0) {
                <span class="cart-badge">{{ cartCount }}</span>
              }
            </a>
            <a routerLink="/orders" routerLinkActive="nav-active" class="nav-link">Orders</a>
          }

          @if (authService.isAdmin) {
            <a routerLink="/admin" routerLinkActive="nav-active" class="nav-link admin-link">
              <span class="material-icons nav-icon-sm">dashboard</span>Admin
            </a>
          }
        </nav>

        <!-- Right Actions -->
        <div class="nav-actions">
          @if (authService.isLoggedIn) {
            <a routerLink="/cart" class="nav-icon-btn mobile-cart" title="Cart">
              <span class="material-icons">shopping_bag</span>
              @if (cartCount > 0) { <span class="icon-badge">{{ cartCount }}</span> }
            </a>
          }

          <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle theme">
            <span class="material-icons theme-icon">{{ themeService.isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          @if (authService.isLoggedIn) {
            <div class="user-menu" (click)="userMenuOpen = !userMenuOpen"
                 (clickOutside)="userMenuOpen = false" clickOutside>
              <div class="user-avatar">
                <span class="avatar-initial">{{ authService.currentUser?.firstName?.charAt(0) }}</span>
                <div class="avatar-ring"></div>
              </div>
              @if (userMenuOpen) {
                <div class="dropdown-menu">
                  <div class="dropdown-header">
                    <div class="avatar-lg">
                      {{ authService.currentUser?.firstName?.charAt(0) }}
                    </div>
                    <div class="dropdown-info">
                      <div class="dropdown-name">{{ authService.currentUser?.firstName }} {{ authService.currentUser?.lastName }}</div>
                      <div class="dropdown-email">{{ authService.currentUser?.email }}</div>
                      <span class="dropdown-role" [class.admin-role]="authService.isAdmin">
                        {{ authService.isAdmin ? 'Administrator' : 'Member' }}
                      </span>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" class="dropdown-item" (click)="userMenuOpen=false">
                    <span class="material-icons">person_outline</span>Profile
                  </a>
                  <a routerLink="/orders" class="dropdown-item" (click)="userMenuOpen=false">
                    <span class="material-icons">receipt_long</span>Orders
                  </a>
                  @if (authService.isAdmin) {
                    <a routerLink="/admin" class="dropdown-item" (click)="userMenuOpen=false">
                      <span class="material-icons">admin_panel_settings</span>Dashboard
                    </a>
                  }
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item dropdown-logout" (click)="logout()">
                    <span class="material-icons">logout</span>Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="nav-login-btn">Sign In</a>
            <a routerLink="/register" class="nav-register-btn">
              Get Started
              <span class="material-icons" style="font-size:14px">arrow_forward</span>
            </a>
          }

          <button class="hamburger" (click)="toggleMobile()" aria-label="Toggle menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen) {
        <div class="mobile-nav">
          <div class="mobile-nav-links">
            <a routerLink="/products"   class="mobile-nav-link" (click)="closeMobile()"><span class="material-icons">storefront</span>Shop</a>
            <a routerLink="/categories" class="mobile-nav-link" (click)="closeMobile()"><span class="material-icons">category</span>Categories</a>
            @if (authService.isLoggedIn) {
              <a routerLink="/cart"    class="mobile-nav-link" (click)="closeMobile()">
                <span class="material-icons">shopping_bag</span>Cart
                @if (cartCount > 0) { <span class="mobile-cart-badge">{{ cartCount }}</span> }
              </a>
              <a routerLink="/orders"  class="mobile-nav-link" (click)="closeMobile()"><span class="material-icons">receipt_long</span>Orders</a>
              <a routerLink="/profile" class="mobile-nav-link" (click)="closeMobile()"><span class="material-icons">person</span>Profile</a>
            }
            @if (authService.isAdmin) {
              <a routerLink="/admin" class="mobile-nav-link admin-nav" (click)="closeMobile()"><span class="material-icons">dashboard</span>Admin Dashboard</a>
            }
          </div>
          @if (!authService.isLoggedIn) {
            <div class="mobile-auth-actions">
              <a routerLink="/login"    class="mobile-auth-btn mobile-auth-secondary" (click)="closeMobile()">Sign In</a>
              <a routerLink="/register" class="mobile-auth-btn mobile-auth-primary"   (click)="closeMobile()">Create Account</a>
            </div>
          }
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 900;
      background: transparent;
      transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
    }

    .navbar.scrolled {
      background: var(--navbar-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid var(--navbar-border);
      box-shadow: 0 1px 0 var(--navbar-border), 0 8px 40px rgba(0,0,0,0.5);
    }

    .navbar-inner {
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 clamp(24px, 5vw, 80px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      transition: height 0.3s ease;
    }

    .navbar.scrolled .navbar-inner { height: 62px; }

    /* ── BRAND ── */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      z-index: 10;
    }

    .brand-mark {
      width: 32px; height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent);
      position: relative;
      overflow: hidden;
    }

    .brand-mark::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    }

    .brand-mark-e {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      letter-spacing: -0.02em;
      position: relative;
      z-index: 1;
    }

    .brand-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.12em;
      color: var(--text-primary);
      transition: color 0.2s;
    }

    .nav-brand:hover .brand-text { color: var(--accent); }

    /* ── NAV LINKS ── */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .nav-link {
      padding: 8px 20px;
      color: var(--text-secondary);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-decoration: none;
      position: relative;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; right: 50%;
      height: 2px;
      background: var(--accent);
      transition: left 0.25s ease, right 0.25s ease;
    }

    .nav-link:hover { color: var(--text-primary); }
    .nav-link:hover::after { left: 20px; right: 20px; }

    .nav-link.nav-active {
      color: var(--text-primary);
    }

    .nav-link.nav-active::after { left: 20px; right: 20px; }

    .nav-icon-sm { font-size: 15px; opacity: 0.75; }

    .cart-link { position: relative; }
    .cart-badge {
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 2px;
      min-width: 18px;
      text-align: center;
      font-family: 'Barlow Condensed', sans-serif;
      letter-spacing: 0.05em;
    }

    /* ── RIGHT ACTIONS ── */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
    }

    .nav-icon-btn {
      position: relative;
      width: 38px; height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: color 0.2s;
      text-decoration: none;
    }

    .nav-icon-btn:hover { color: var(--accent); }
    .nav-icon-btn .material-icons { font-size: 20px; }

    .icon-badge {
      position: absolute;
      top: 4px; right: 4px;
      background: var(--accent);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      width: 14px; height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-cart { display: none; }

    /* ── THEME TOGGLE ── */
    .theme-toggle {
      width: 34px; height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s, background 0.2s;
    }

    .theme-toggle:hover {
      color: var(--accent);
      border-color: var(--accent-border);
      background: var(--accent-dim);
    }

    .theme-toggle .material-icons { font-size: 16px; }

    /* ── USER MENU ── */
    .user-menu { position: relative; cursor: pointer; }

    .user-avatar {
      width: 32px; height: 32px;
      position: relative;
      transition: transform 0.2s;
    }

    .user-avatar:hover { transform: scale(1.08); }

    .avatar-initial {
      width: 100%; height: 100%;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }

    .avatar-ring {
      position: absolute;
      inset: -2px;
      background: var(--accent);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 0;
    }

    .avatar-ring::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: var(--bg-primary);
    }

    .user-avatar:hover .avatar-ring { opacity: 1; }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 16px);
      right: -8px;
      width: 272px;
      background: var(--bg-2);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-float);
      padding: 6px;
      animation: dropdownIn 0.22s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 100;
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      padding: 14px 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 4px;
    }

    .avatar-lg {
      width: 40px; height: 40px;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .dropdown-info { display: flex; flex-direction: column; min-width: 0; }

    .dropdown-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-email {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      color: var(--text-tertiary);
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-role {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 4px;
    }

    .dropdown-role.admin-role { color: var(--warning); }

    .dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      color: var(--text-secondary);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
    }

    .dropdown-item:hover { background: var(--bg-3); color: var(--text-primary); }
    .dropdown-item .material-icons { font-size: 16px; color: var(--text-tertiary); }
    .dropdown-item:hover .material-icons { color: var(--accent); }
    .dropdown-logout:hover { background: var(--danger-bg); color: var(--danger); }
    .dropdown-logout:hover .material-icons { color: var(--danger); }

    /* ── AUTH BUTTONS ── */
    .nav-login-btn {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      padding: 8px 14px;
      text-decoration: none;
      transition: color 0.2s;
    }

    .nav-login-btn:hover { color: var(--text-primary); }

    .nav-register-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--accent);
      color: #fff;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 9px 20px;
      text-decoration: none;
      transition: background 0.2s, box-shadow 0.2s;
    }

    .nav-register-btn:hover {
      background: var(--accent-hover);
      box-shadow: 0 4px 20px var(--accent-glow);
      color: #fff;
    }

    /* ── HAMBURGER ── */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      z-index: 10;
      width: 36px; height: 36px;
    }

    .hamburger-line {
      display: block;
      width: 20px; height: 1.5px;
      background: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: center;
    }

    .navbar.nav-open .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(4.5px, 4.5px); }
    .navbar.nav-open .hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .navbar.nav-open .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(4.5px, -4.5px); }

    /* ── MOBILE NAV ── */
    .mobile-nav {
      position: fixed;
      top: 62px; left: 0; right: 0;
      background: var(--bg-1);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px 24px;
      animation: slideDown 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 899;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .mobile-nav-links { display: flex; flex-direction: column; gap: 2px; }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      color: var(--text-secondary);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: all 0.18s;
    }

    .mobile-nav-link:hover {
      color: var(--text-primary);
      border-left-color: var(--accent);
      background: var(--bg-2);
    }

    .mobile-nav-link .material-icons { font-size: 18px; opacity: 0.55; }
    .mobile-nav-link.admin-nav { color: var(--warning); }

    .mobile-cart-badge {
      margin-left: auto;
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      font-family: 'Barlow Condensed', sans-serif;
    }

    .mobile-auth-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .mobile-auth-btn {
      flex: 1;
      text-align: center;
      padding: 12px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-decoration: none;
      transition: all 0.2s;
    }

    .mobile-auth-secondary {
      color: var(--text-primary);
      border: 1px solid var(--border-bright);
    }

    .mobile-auth-secondary:hover {
      border-color: var(--accent-border);
      color: var(--accent);
    }

    .mobile-auth-primary {
      background: var(--accent);
      color: #fff;
    }

    .mobile-auth-primary:hover { background: var(--accent-hover); }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-login-btn, .nav-register-btn { display: none; }
      .mobile-cart { display: flex; }
    }

    @media (max-width: 480px) {
      .navbar-inner { padding: 0 16px; }
      .brand-text { display: none; }
    }
  `]
})
export class HeaderComponent {
  isScrolled = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  cartCount = 0;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  @HostListener('window:scroll')
  onScroll(): void { this.isScrolled = window.scrollY > 20; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-menu')) this.userMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void { this.userMenuOpen = false; }

  toggleMobile(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobile(): void  { this.mobileMenuOpen = false; }

  navigateHome(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
    this.closeMobile();
  }

  logout(): void {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
