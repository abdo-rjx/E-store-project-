import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path class="wave-path" d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,70 1440,60 L1440,120 L0,120 Z"></path>
        </svg>
      </div>
      <div class="footer-inner">
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <span class="footer-icon">E</span>
            <span class="footer-text">Estoré</span>
          </a>
          <p class="footer-tagline">Premium Electronics. Precision Engineering.</p>
        </div>
        <nav class="footer-nav">
          <a routerLink="/products">Shop</a>
          <span class="footer-sep">·</span>
          <a routerLink="/cart">Cart</a>
          <span class="footer-sep">·</span>
          <a routerLink="/orders">Orders</a>
          <span class="footer-sep">·</span>
          <a routerLink="/profile">Profile</a>
        </nav>
        <div class="footer-copy">
          © 2026 Estoré. All rights reserved.
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      border-top: 1px solid var(--border-primary);
      background: var(--bg-secondary);
      padding: 56px 24px 40px;
      margin-top: auto;
      overflow: hidden;
    }

    .footer-wave {
      position: absolute;
      top: -1px;
      left: 0;
      right: 0;
      width: 100%;
      height: 60px;
      overflow: hidden;
    }

    .footer-wave svg {
      width: 100%;
      height: 100%;
    }

    .wave-path {
      fill: var(--bg-primary);
      transition: fill 0.5s ease;
    }

    .footer-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
    }

    .footer-icon {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      border-radius: 8px;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 15px;
      color: #fff;
    }

    .footer-text {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.02em;
    }

    .footer-tagline {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      letter-spacing: 0.04em;
    }

    .footer-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-nav a {
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-nav a:hover { color: var(--accent-primary); }

    .footer-sep {
      color: var(--text-tertiary);
      font-size: 12px;
    }

    .footer-copy {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }
  `]
})
export class FooterComponent {}
