import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-top-rule"></div>

      <div class="footer-body">
        <div class="footer-grid">

          <!-- Brand column -->
          <div class="footer-brand">
            <a routerLink="/" class="footer-logo">
              <div class="footer-mark">
                <span class="footer-mark-e">E</span>
              </div>
              <span class="footer-logo-text">ESTORÉ</span>
            </a>
            <p class="footer-tagline">Premium Electronics.<br>Precision Engineered.</p>
            <div class="footer-social">
              <a class="social-btn" title="Twitter" aria-label="Twitter">
                <span class="material-icons">alternate_email</span>
              </a>
              <a class="social-btn" title="Instagram" aria-label="Instagram">
                <span class="material-icons">photo_camera</span>
              </a>
              <a class="social-btn" title="YouTube" aria-label="YouTube">
                <span class="material-icons">play_circle</span>
              </a>
            </div>
          </div>

          <!-- Shop links -->
          <div class="footer-col">
            <h5 class="footer-col-title">Shop</h5>
            <nav class="footer-links">
              <a routerLink="/products"   class="footer-link">All Products</a>
              <a routerLink="/categories" class="footer-link">Categories</a>
              <a routerLink="/products"   class="footer-link">New Arrivals</a>
              <a routerLink="/products"   class="footer-link">Best Sellers</a>
            </nav>
          </div>

          <!-- Account links -->
          <div class="footer-col">
            <h5 class="footer-col-title">Account</h5>
            <nav class="footer-links">
              <a routerLink="/login"    class="footer-link">Sign In</a>
              <a routerLink="/register" class="footer-link">Create Account</a>
              <a routerLink="/orders"   class="footer-link">My Orders</a>
              <a routerLink="/profile"  class="footer-link">Profile</a>
            </nav>
          </div>

          <!-- Support links -->
          <div class="footer-col">
            <h5 class="footer-col-title">Support</h5>
            <nav class="footer-links">
              <a class="footer-link">Help Center</a>
              <a class="footer-link">Shipping Policy</a>
              <a class="footer-link">Returns &amp; Refunds</a>
              <a class="footer-link">Contact Us</a>
            </nav>
          </div>

        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
          <p class="footer-copy">© 2026 Estoré. All rights reserved.</p>
          <div class="footer-badges">
            <span class="footer-badge">
              <span class="material-icons">verified_user</span>Secure Checkout
            </span>
            <span class="footer-badge">
              <span class="material-icons">local_shipping</span>Free Shipping
            </span>
            <span class="footer-badge">
              <span class="material-icons">replay</span>30-Day Returns
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      background: var(--bg-0);
      margin-top: auto;
    }

    .footer-top-rule {
      height: 1px;
      background: var(--border);
    }

    /* Red accent rule on hover/focus — small detail */
    .footer-top-rule::after {
      content: '';
      display: block;
      height: 1px;
      width: 120px;
      background: var(--accent);
      opacity: 0.7;
    }

    .footer-body {
      max-width: 1440px;
      margin: 0 auto;
      padding: 64px clamp(24px, 5vw, 80px) 40px;
    }

    /* ── Grid ── */
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid var(--border);
    }

    /* ── Brand ── */
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .footer-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      width: fit-content;
    }

    .footer-mark {
      width: 30px; height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    .footer-mark::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
    }

    .footer-mark-e {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: 16px;
      color: #fff;
      position: relative;
      z-index: 1;
    }

    .footer-logo-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.12em;
    }

    .footer-tagline {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      line-height: 1.8;
    }

    .footer-social {
      display: flex;
      gap: 8px;
    }

    .social-btn {
      width: 34px; height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
      text-decoration: none;
    }

    .social-btn:hover {
      border-color: var(--accent-border);
      color: var(--accent);
      background: var(--accent-dim);
    }

    .social-btn .material-icons { font-size: 15px; }

    /* ── Columns ── */
    .footer-col { display: flex; flex-direction: column; gap: 18px; }

    .footer-col-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-tertiary);
    }

    .footer-links { display: flex; flex-direction: column; gap: 10px; }

    .footer-link {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.18s;
      cursor: pointer;
      width: fit-content;
      position: relative;
    }

    .footer-link::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 100%;
      height: 1px;
      background: var(--accent);
      transition: right 0.2s ease;
    }

    .footer-link:hover { color: var(--text-primary); }
    .footer-link:hover::after { right: 0; }

    /* ── Bottom ── */
    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .footer-copy {
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .footer-badges {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
    }

    .footer-badge .material-icons { font-size: 13px; color: var(--accent); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
      .footer-brand { grid-column: 1 / -1; }
    }

    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; gap: 28px; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
      .footer-badges { gap: 14px; }
    }
  `]
})
export class FooterComponent {}
