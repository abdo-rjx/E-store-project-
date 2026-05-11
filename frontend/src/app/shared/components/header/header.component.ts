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
          <span class="brand-icon">
            <span class="brand-icon-inner">E</span>
          </span>
          <span class="brand-text">Estoré</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links">
          <a routerLink="/products" routerLinkActive="nav-active"
             [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            Shop
          </a>
          <a routerLink="/categories" routerLinkActive="nav-active" class="nav-link">
            Categories
          </a>

          @if (authService.isLoggedIn) {
            <a routerLink="/cart" routerLinkActive="nav-active" class="nav-link cart-link">
              Cart
              @if (cartCount > 0) {
                <span class="cart-badge">{{ cartCount }}</span>
              }
            </a>
            <a routerLink="/orders" routerLinkActive="nav-active" class="nav-link">
              Orders
            </a>
          }

          @if (authService.isAdmin) {
            <a routerLink="/admin" routerLinkActive="nav-active" class="nav-link admin-link">
              <span class="material-icons nav-icon-sm">dashboard</span>
              Admin
            </a>
          }
        </nav>

        <!-- Right Actions -->
        <div class="nav-actions">
          @if (authService.isLoggedIn) {
            <a routerLink="/cart" class="nav-icon-btn mobile-cart" title="Cart">
              <span class="material-icons">shopping_bag</span>
              @if (cartCount > 0) {
                <span class="icon-badge">{{ cartCount }}</span>
              }
            </a>
          }

          <!-- Theme Toggle -->
          <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle theme">
            <span class="material-icons theme-icon">
              {{ themeService.isDark ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          @if (authService.isLoggedIn) {
            <div class="user-menu" (click)="userMenuOpen = !userMenuOpen" (clickOutside)="userMenuOpen = false" clickOutside>
              <div class="user-avatar">
                <span class="avatar-initial">{{ authService.currentUser?.firstName?.charAt(0) }}</span>
                <span class="avatar-ring"></span>
              </div>
              @if (userMenuOpen) {
                <div class="dropdown-menu">
                  <div class="dropdown-header">
                    <div class="avatar-lg">{{ authService.currentUser?.firstName?.charAt(0) }}</div>
                    <div class="dropdown-info">
                      <div class="dropdown-name">{{ authService.currentUser?.firstName }} {{ authService.currentUser?.lastName }}</div>
                      <div class="dropdown-email">{{ authService.currentUser?.email }}</div>
                      <span class="dropdown-role" [class.admin-role]="authService.isAdmin">
                        {{ authService.isAdmin ? 'Administrator' : 'Member' }}
                      </span>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" class="dropdown-item" (click)="userMenuOpen = false">
                    <span class="material-icons">person_outline</span>
                    Profile
                  </a>
                  <a routerLink="/orders" class="dropdown-item" (click)="userMenuOpen = false">
                    <span class="material-icons">receipt_long</span>
                    Orders
                  </a>
                  @if (authService.isAdmin) {
                    <a routerLink="/admin" class="dropdown-item" (click)="userMenuOpen = false">
                      <span class="material-icons">admin_panel_settings</span>
                      Dashboard
                    </a>
                  }
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item dropdown-logout" (click)="logout()">
                    <span class="material-icons">logout</span>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="nav-login-btn">Sign In</a>
            <a routerLink="/register" class="nav-register-btn">Get Started</a>
          }

          <!-- Mobile Hamburger -->
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
            <a routerLink="/products" class="mobile-nav-link" (click)="closeMobile()">
              <span class="material-icons">storefront</span>
              Shop
            </a>
            <a routerLink="/categories" class="mobile-nav-link" (click)="closeMobile()">
              <span class="material-icons">category</span>
              Categories
            </a>
            @if (authService.isLoggedIn) {
              <a routerLink="/cart" class="mobile-nav-link" (click)="closeMobile()">
                <span class="material-icons">shopping_bag</span>
                Cart
                @if (cartCount > 0) {
                  <span class="mobile-cart-badge">{{ cartCount }}</span>
                }
              </a>
              <a routerLink="/orders" class="mobile-nav-link" (click)="closeMobile()">
                <span class="material-icons">receipt_long</span>
                Orders
              </a>
              <a routerLink="/profile" class="mobile-nav-link" (click)="closeMobile()">
                <span class="material-icons">person</span>
                Profile
              </a>
            }
            @if (authService.isAdmin) {
              <a routerLink="/admin" class="mobile-nav-link admin-nav" (click)="closeMobile()">
                <span class="material-icons">dashboard</span>
                Admin Dashboard
              </a>
            }
          </div>
          @if (!authService.isLoggedIn) {
            <div class="mobile-auth-actions">
              <a routerLink="/login" class="mobile-auth-btn mobile-auth-secondary" (click)="closeMobile()">Sign In</a>
              <a routerLink="/register" class="mobile-auth-btn mobile-auth-primary" (click)="closeMobile()">Create Account</a>
            </div>
          }
        </div>
      }
    </header>
  `,
  styles: [`
    /* ---- NAVBAR ---- */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 0 24px;
      background: transparent;
      transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .navbar.scrolled {
      background: var(--navbar-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border-bottom: 1px solid var(--navbar-border);
      box-shadow: var(--shadow-sm);
    }

    .navbar-inner {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 0 clamp(24px, 5vw, 80px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      transition: height 0.3s ease;
    }

    .navbar.scrolled .navbar-inner {
      height: 64px;
    }

    /* ---- BRAND ---- */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 800;
      font-size: 18px;
      letter-spacing: -0.02em;
      z-index: 10;
      transition: opacity 0.3s;
    }

    .nav-brand:hover { opacity: 0.85; }

    .brand-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .brand-icon::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    }

    .brand-icon-inner {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 16px;
      color: #fff;
      position: relative;
      z-index: 1;
    }

    .brand-text {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.02em;
    }

    /* ---- NAV LINKS ---- */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      padding: 8px 18px;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: var(--accent-primary);
      border-radius: 1px;
      transition: width 0.3s ease;
    }

    .nav-link:hover {
      color: var(--text-primary);
    }

    .nav-link:hover::before {
      width: 20px;
    }

    .nav-link.nav-active {
      color: var(--accent-primary);
    }

    .nav-link.nav-active::before {
      width: 20px;
    }

    .nav-icon-sm {
      font-size: 16px;
      opacity: 0.7;
    }

    /* Cart badge in nav */
    .cart-link {
      position: relative;
    }

    .cart-badge {
      background: var(--accent-primary);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-pill);
      min-width: 18px;
      text-align: center;
      line-height: 1.2;
    }

    /* ---- RIGHT ACTIONS ---- */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10;
    }

    .nav-icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      transition: all 0.2s;
      text-decoration: none;
    }

    .nav-icon-btn:hover {
      color: var(--accent-primary);
      background: var(--accent-primary-glow);
    }

    .nav-icon-btn .material-icons { font-size: 20px; }

    .icon-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--accent-primary);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .mobile-cart { display: none; }

    /* ---- THEME TOGGLE ---- */
    .theme-toggle {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-secondary);
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.3s;
    }

    .theme-toggle:hover {
      color: var(--accent-primary);
      border-color: var(--accent-primary);
      background: var(--accent-primary-glow);
      transform: rotate(30deg);
    }

    .theme-toggle .material-icons { font-size: 18px; }

    /* ---- USER MENU ---- */
    .user-menu {
      position: relative;
      cursor: pointer;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s;
    }

    .user-avatar:hover {
      transform: scale(1.1);
    }

    .avatar-initial {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }

    .avatar-ring {
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .user-avatar:hover .avatar-ring {
      opacity: 1;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 12px);
      right: -8px;
      width: 280px;
      background: var(--bg-card);
      border: 1px solid var(--border-secondary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-float);
      padding: 8px;
      animation: dropdownIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 100;
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-header {
      padding: 16px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-lg {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .dropdown-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .dropdown-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-email {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-role {
      font-size: 10px;
      font-weight: 600;
      color: var(--accent-primary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 4px;
    }

    .dropdown-role.admin-role {
      color: var(--accent-coral);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-primary);
      margin: 4px 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
    }

    .dropdown-item:hover {
      background: var(--accent-primary-glow);
      color: var(--accent-primary);
    }

    .dropdown-item .material-icons { font-size: 18px; }

    .dropdown-logout:hover {
      background: var(--danger-bg);
      color: var(--danger);
    }

    /* ---- AUTH BUTTONS ---- */
    .nav-login-btn {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .nav-login-btn:hover {
      color: var(--text-primary);
      background: var(--bg-card);
    }

    .nav-register-btn {
      background: var(--accent-gradient);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 20px;
      border-radius: var(--radius-pill);
      transition: all 0.3s;
      box-shadow: 0 2px 12px var(--accent-primary-glow);
    }

    .nav-register-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      color: #fff;
    }

    /* ---- HAMBURGER ---- */
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
      width: 36px;
      height: 36px;
    }

    .hamburger-line {
      display: block;
      width: 20px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: center;
    }

    .navbar.nav-open .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .navbar.nav-open .hamburger-line:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }
    .navbar.nav-open .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    /* ---- MOBILE NAV ---- */
    .mobile-nav {
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-primary);
      padding: 16px 24px 24px;
      animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 999;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }

    .mobile-nav-link:hover, .mobile-nav-link.nav-active {
      color: var(--text-primary);
      background: var(--bg-card);
    }

    .mobile-nav-link .material-icons {
      font-size: 20px;
      opacity: 0.6;
    }

    .mobile-nav-link.admin-nav {
      color: var(--accent-coral);
    }

    .mobile-nav-link.admin-nav .material-icons {
      color: var(--accent-coral);
      opacity: 1;
    }

    .mobile-cart-badge {
      margin-left: auto;
      background: var(--accent-primary);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--radius-pill);
    }

    .mobile-auth-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-primary);
    }

    .mobile-auth-btn {
      flex: 1;
      text-align: center;
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .mobile-auth-secondary {
      color: var(--text-primary);
      border: 1px solid var(--border-secondary);
    }

    .mobile-auth-primary {
      background: var(--accent-gradient);
      color: #fff;
      box-shadow: 0 2px 12px var(--accent-primary-glow);
    }

    /* ---- MOBILE ---- */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-login-btn, .nav-register-btn { display: none; }
      .mobile-cart { display: flex; }
    }

    @media (max-width: 480px) {
      .navbar { padding: 0 16px; }
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
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.userMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void {
    this.userMenuOpen = false;
  }

  toggleMobile(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobile(): void {
    this.mobileMenuOpen = false;
  }

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
