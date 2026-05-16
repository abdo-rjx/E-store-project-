import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StickySectionComponent } from '../../shared/components/sticky-section/sticky-section.component';
import { ProductShowcaseComponent } from '../../shared/components/product-showcase/product-showcase.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, StickySectionComponent, ProductShowcaseComponent, ScrollRevealDirective],
  template: `

    <!-- ═══════════════════════════════════════════
         CINEMATIC SLIDER
    ═══════════════════════════════════════════ -->
    <section class="cinema-slider">
      <div class="slider-deco">
        <div class="deco-block deco-block--a"></div>
        <div class="deco-block deco-block--b"></div>
        <div class="deco-ring"></div>
        <div class="deco-grid"></div>
      </div>

      <div class="slider-frames" [class.active]="sliderLoaded">
        @for (product of latestProducts; track product.id; let i = $index) {
          <article class="slide-frame" [class.is-active]="i === activeSlide"
                   [attr.aria-hidden]="i !== activeSlide">
            @if (product.videoPath) {
              <video [src]="product.videoPath" muted [muted]="true" loop
                     [autoplay]="i === activeSlide" [playsInline]="true"
                     class="frame-media"></video>
            } @else {
              <img [src]="product.imagePaths?.[0] || product.imageUrl"
                   [alt]="product.name" class="frame-media">
            }
            <div class="frame-vignette"></div>
            <div class="frame-content">
              <div class="frame-eyebrow">
                <span class="eyebrow-rule"></span>
                <span class="eyebrow-text">New Arrival — N° {{ i + 1 }}</span>
              </div>
              <h1 class="frame-heading">{{ product.name }}</h1>
              <p class="frame-sub">{{ product.description }}</p>
              <div class="frame-actions">
                <button class="btn-discover" (click)="goToProduct(product.id)">
                  Discover Now
                  <span class="material-icons">arrow_forward</span>
                </button>
                <div class="frame-price-wrap">
                  <span class="frame-price-label">Starting at</span>
                  <span class="frame-price">\${{ product.price | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </article>
        }
      </div>

      @if (latestProducts.length > 1) {
        <nav class="slider-nav">
          <button class="nav-chevron" (click)="prevSlide()" aria-label="Previous">
            <span class="material-icons">chevron_left</span>
          </button>
          <div class="nav-dots">
            @for (p of latestProducts; track p.id; let i = $index) {
              <button class="nav-dot" [class.active]="i === activeSlide"
                      (click)="goToSlide(i)"></button>
            }
          </div>
          <button class="nav-chevron" (click)="nextSlide()" aria-label="Next">
            <span class="material-icons">chevron_right</span>
          </button>
        </nav>
      }

      <div class="scroll-hint">
        <div class="scroll-hint-line"></div>
        <span class="scroll-hint-label">Scroll</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CATEGORY STRIP
    ═══════════════════════════════════════════ -->
    <section class="cat-strip" appScrollReveal="fade-up">
      <div class="cat-strip-inner">
        <button class="cat-pill" (click)="goToCategory('Smartphones')">
          <span class="material-icons cat-pill-icon">smartphone</span>
          <span class="cat-pill-label">Smartphones</span>
        </button>
        <button class="cat-pill" (click)="goToCategory('Laptops')">
          <span class="material-icons cat-pill-icon">laptop</span>
          <span class="cat-pill-label">Laptops</span>
        </button>
        <button class="cat-pill" (click)="goToCategory('Accessories')">
          <span class="material-icons cat-pill-icon">cable</span>
          <span class="cat-pill-label">Accessories</span>
        </button>
        <button class="cat-pill cat-pill--all" (click)="goToProducts()">
          <span class="material-icons cat-pill-icon">grid_view</span>
          <span class="cat-pill-label">All Products</span>
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         STATS ROW
    ═══════════════════════════════════════════ -->
    <section class="stats-section container" appScrollReveal="fade-up">
      <div class="stats-grid">
        <div class="stat-card" appScrollReveal="scale-up" [revealDelay]="0.0">
          <span class="stat-value">500<span class="stat-suffix">+</span></span>
          <span class="stat-label">Products</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card" appScrollReveal="scale-up" [revealDelay]="0.1">
          <span class="stat-value">12K<span class="stat-suffix">+</span></span>
          <span class="stat-label">Customers</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card" appScrollReveal="scale-up" [revealDelay]="0.2">
          <span class="stat-value">4.9<span class="stat-suffix">★</span></span>
          <span class="stat-label">Avg Rating</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card" appScrollReveal="scale-up" [revealDelay]="0.3">
          <span class="stat-value">Free</span>
          <span class="stat-label">Worldwide Shipping</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SONY-STYLE FEATURED HERO
    ═══════════════════════════════════════════ -->
    @if (featuredProducts.length > 0) {
      <section class="sony-hero" appScrollReveal="fade-up">
        <div class="sony-hero-inner">
          <div class="sony-hero-visual">
            <img
              [src]="featuredProducts[featuredIndex].imagePaths?.[0] || featuredProducts[featuredIndex].imageUrl"
              [alt]="featuredProducts[featuredIndex].name"
              class="sony-hero-img"
              onerror="this.src='https://placehold.co/600x500/141414/C8102E?text=ESTORÉ'"
            />
          </div>
          <div class="sony-hero-content">
            <div class="sony-eyebrow">
              <span class="eyebrow-rule"></span>
              <span>Featured Product</span>
            </div>
            <h2 class="sony-title">{{ featuredProducts[featuredIndex].name }}</h2>
            <p class="sony-desc">{{ featuredProducts[featuredIndex].description }}</p>
            <span class="sony-price">\${{ featuredProducts[featuredIndex].price | number:'1.2-2' }}</span>
            <button class="sony-cta" (click)="goToProduct(featuredProducts[featuredIndex].id)">
              Shop Now
              <span class="material-icons">arrow_forward</span>
            </button>
            @if (featuredProducts.length > 1) {
              <div class="sony-nav">
                @for (p of featuredProducts; track p.id; let i = $index) {
                  <button class="sony-dot" [class.is-active]="i === featuredIndex"
                          (click)="featuredIndex = i"
                          [attr.aria-label]="'View ' + p.name"></button>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- ═══════════════════════════════════════════
         SCROLL-PINNED VIDEO REVEAL (GSAP)
    ═══════════════════════════════════════════ -->
    <section class="video-reveal-section" id="video-reveal">
      <div class="video-reveal-sticky">
        <video src="/uploads/tt4.mp4" muted loop playsinline autoplay preload="auto"
               class="video-reveal-media" id="reveal-video"></video>
        <div class="video-reveal-overlay"></div>
        <div class="video-reveal-texts">
          <div class="vr-bg-layer" id="text-bg"></div>
          <div class="vr-group" id="group1">
            <h2 class="vr-title" id="title1">Ultra-Fast Delivery</h2>
            <p class="vr-desc" id="desc1">Order today. Delivered to your door tomorrow.</p>
          </div>
          <div class="vr-group" id="group2">
            <h2 class="vr-title" id="title2">Curated Selection</h2>
            <p class="vr-desc" id="desc2">500+ handpicked products. Zero compromise on quality.</p>
          </div>
          <div class="vr-group" id="group3">
            <h2 class="vr-title" id="title3">Free Returns</h2>
            <p class="vr-desc" id="desc3">30-day hassle-free returns. No questions asked.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         APPLE TV SHOWCASE
    ═══════════════════════════════════════════ -->
    <section class="tv-showcase" appScrollReveal="fade-up">
      <div class="tv-showcase-inner">
        <h2 class="tv-showcase-heading">
          Watch, sing, play,<br>and work out.
        </h2>
        <div class="tv-showcase-row">
          <div class="tv-showcase-left">
            <div class="tv-wrapper">
              <img src="/uploads/images/Chat.png" alt="TV"
                   class="tv-img"
                   onerror="this.parentElement.style.background='#111';this.style.display='none'">
              <video class="tv-screen" id="tv-screen-video" autoplay muted loop playsinline>
                <source src="/uploads/videos/tvideo.mp4" type="video/mp4">
              </video>
            </div>
          </div>
          <div class="tv-showcase-right" appScrollReveal="slide-right" [revealDelay]="0.2">
            <div class="tv-eyebrow">
              <span class="eyebrow-rule"></span>
              <span>Premium Displays</span>
            </div>
            <h3 class="tv-right-heading">The Ultimate<br>Home Cinema</h3>
            <p class="tv-right-text">
              The latest TVs with breathtaking displays,
              studio-grade audio, and a full satisfaction guarantee.
              Experience cinema at home.
            </p>
            <button class="tv-right-cta" (click)="goToProducts()">
              Explore Displays
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         HEADPHONES SHOWCASE
    ═══════════════════════════════════════════ -->
    <section class="hp-showcase" appScrollReveal="fade-up">
      <div class="hp-showcase-inner">
        <div class="hp-showcase-left" appScrollReveal="slide-right" [revealDelay]="0.1">
          <div class="headphones-wrapper">
            <img src="/uploads/images/kk.png" alt="Premium Headphones"
                 onerror="this.style.display='none'">
          </div>
        </div>
        <div class="hp-showcase-right" appScrollReveal="slide-right" [revealDelay]="0.25">
          <div class="hp-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Premium Audio</span>
          </div>
          <h2 class="hp-heading">Elevate Your<br>Listening Experience</h2>
          <p class="hp-text">
            Premium sound in three signature colors.
            ANC, 40h battery, studio-grade audio.
          </p>
          <button class="hp-cta" (click)="goToProducts()">
            Shop Audio
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         FEATURED PRODUCTS
    ═══════════════════════════════════════════ -->
    <app-product-showcase
      [products]="featuredProducts"
      appScrollReveal="scale-up"
    ></app-product-showcase>

    <!-- ═══════════════════════════════════════════
         WHY CHOOSE US
    ═══════════════════════════════════════════ -->
    <app-sticky-section
      label="WHY CHOOSE US"
      title="An Experience, Not Just a Store"
      description="Free shipping on all orders, 24/7 dedicated support, and a 30-day hassle-free return policy. Your satisfaction is our priority."
      gradient="linear-gradient(135deg, #0A0A0A 0%, #141414 100%)"
      layout="right"
      appScrollReveal="fade-up"
    >
      <div content class="perks-list">
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.1">
          <div class="perk-icon-wrap">
            <span class="material-icons">local_shipping</span>
          </div>
          <div class="perk-body">
            <h4>Free Express Shipping</h4>
            <p>On all orders, no minimum required</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.2">
          <div class="perk-icon-wrap">
            <span class="material-icons">support_agent</span>
          </div>
          <div class="perk-body">
            <h4>24/7 Expert Support</h4>
            <p>Real people, real solutions</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.3">
          <div class="perk-icon-wrap">
            <span class="material-icons">replay</span>
          </div>
          <div class="perk-body">
            <h4>30-Day Returns</h4>
            <p>No questions asked, full refund</p>
          </div>
        </div>
      </div>
    </app-sticky-section>

    <!-- ═══════════════════════════════════════════
         CTA
    ═══════════════════════════════════════════ -->
    <section class="cta-section" appScrollReveal="fade-up">
      <div class="cta-accent-line"></div>
      <div class="cta-inner container">
        <span class="cta-eyebrow">Ready to Upgrade?</span>
        <h2 class="cta-heading">
          Join thousands of customers<br>
          who trust <em>Estoré</em> for their tech.
        </h2>
        <p class="cta-sub">Explore our full catalog — from flagship smartphones to pro accessories.</p>
        <div class="cta-actions">
          <button class="cta-btn-primary" (click)="goToProducts()">
            <span class="material-icons">storefront</span>
            Browse Full Catalog
          </button>
          <button class="cta-btn-secondary" (click)="goToProducts()">
            View New Arrivals
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ═══════════════════════════════
       CINEMA SLIDER
    ═══════════════════════════════ */
    .cinema-slider {
      position: relative;
      height: 95vh;
      min-height: 580px;
      overflow: hidden;
      background: #050505;
    }

    .slider-deco {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 3;
    }

    .deco-block {
      position: absolute;
      border: 1px solid rgba(200, 16, 46, 0.18);
    }

    .deco-block--a {
      width: 80px; height: 80px;
      top: 18%; right: 9%;
      transform: perspective(400px) rotateX(30deg) rotateY(-40deg);
      animation: float3d 10s ease-in-out infinite;
      background: rgba(200, 16, 46, 0.04);
    }

    .deco-block--b {
      width: 44px; height: 44px;
      top: 55%; right: 16%;
      transform: perspective(400px) rotateX(-20deg) rotateY(30deg) rotateZ(15deg);
      animation: float3d-b 7s ease-in-out infinite 1.8s;
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .deco-ring {
      position: absolute;
      width: 120px; height: 120px;
      border-radius: 50%;
      border: 1px solid rgba(200, 16, 46, 0.12);
      bottom: 22%; right: 6%;
      animation: float3d 14s ease-in-out infinite 2.5s;
    }

    .deco-ring::after {
      content: '';
      position: absolute;
      inset: 14px;
      border-radius: 50%;
      border: 1px solid rgba(200, 16, 46, 0.06);
    }

    .deco-grid {
      position: absolute;
      width: 110px; height: 110px;
      top: 12%; right: 26%;
      background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px);
      background-size: 14px 14px;
      animation: float3d-c 12s ease-in-out infinite 0.5s;
      opacity: 0.35;
    }

    @keyframes float3d {
      0%, 100% { transform: perspective(400px) rotateX(30deg) rotateY(-40deg) translateY(0); }
      50% { transform: perspective(400px) rotateX(30deg) rotateY(-40deg) translateY(-12px); }
    }

    @keyframes float3d-b {
      0%, 100% { transform: perspective(400px) rotateX(-20deg) rotateY(30deg) rotateZ(15deg) translateY(0); }
      50% { transform: perspective(400px) rotateX(-20deg) rotateY(30deg) rotateZ(15deg) translateY(-8px); }
    }

    @keyframes float3d-c {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .slider-frames {
      position: relative;
      width: 100%; height: 100%;
      opacity: 0;
      transition: opacity 0.9s ease;
    }

    .slider-frames.active { opacity: 1; }

    .slide-frame {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
    }

    .slide-frame.is-active { opacity: 1; }

    .frame-media {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      transform: scale(1.04);
      transition: transform 9s ease;
    }

    .slide-frame.is-active .frame-media { transform: scale(1); }

    .frame-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        100deg,
        rgba(5,5,5,0.93) 0%,
        rgba(5,5,5,0.62) 42%,
        rgba(5,5,5,0.18) 72%,
        rgba(5,5,5,0.06) 100%
      );
    }

    .frame-content {
      position: relative;
      z-index: 4;
      max-width: 660px;
      padding: 0 clamp(2rem, 5vw, 5rem);
      transform: translateY(36px);
      opacity: 0;
      transition: all 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.45s;
    }

    .slide-frame.is-active .frame-content { transform: translateY(0); opacity: 1; }

    .frame-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .eyebrow-rule {
      display: block;
      width: 32px; height: 2px;
      background: var(--accent);
      flex-shrink: 0;
    }

    .eyebrow-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: var(--accent);
      text-transform: uppercase;
    }

    .frame-heading {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2.8rem, 7vw, 5.2rem);
      font-weight: 800;
      color: #fff;
      line-height: 0.95;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .frame-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      color: rgba(255,255,255,0.55);
      line-height: 1.7;
      margin-bottom: 40px;
      max-width: 480px;
    }

    .frame-actions {
      display: flex;
      align-items: center;
      gap: 32px;
      flex-wrap: wrap;
    }

    .btn-discover {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      background: var(--accent);
      color: #fff;
      border: none;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.3s, transform 0.2s;
    }

    .btn-discover .material-icons { font-size: 16px; transition: transform 0.25s; }

    .btn-discover:hover {
      background: var(--accent-hover);
      box-shadow: 0 4px 28px var(--accent-glow);
      transform: translateY(-2px);
    }

    .btn-discover:hover .material-icons { transform: translateX(4px); }

    .frame-price-wrap { display: flex; flex-direction: column; gap: 2px; }

    .frame-price-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .frame-price {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2.4rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.01em;
      line-height: 1;
    }

    .slider-nav {
      position: absolute;
      bottom: 3rem;
      left: clamp(2rem, 5vw, 5rem);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 10;
    }

    .nav-chevron {
      width: 40px; height: 40px;
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.10);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .nav-chevron:hover { background: var(--accent); border-color: var(--accent); }

    .nav-dots { display: flex; gap: 8px; align-items: center; }

    .nav-dot {
      height: 3px;
      background: rgba(255,255,255,0.2);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.4s ease;
      width: 24px;
    }

    .nav-dot.active { width: 48px; background: var(--accent); }

    .scroll-hint {
      position: absolute;
      bottom: 3rem; right: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      z-index: 10;
      opacity: 0.4;
    }

    .scroll-hint-line {
      width: 1px; height: 48px;
      background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.7));
      animation: scrollPulse 2.2s ease-in-out infinite;
    }

    @keyframes scrollPulse {
      0%, 100% { opacity: 0.4; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.1); }
    }

    .scroll-hint-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      writing-mode: vertical-rl;
    }

    /* ═══════════════════════════════
       CATEGORY STRIP
    ═══════════════════════════════ */
    .cat-strip {
      background: var(--bg-0);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }

    .cat-strip-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 clamp(16px, 4vw, 60px);
      display: flex;
      align-items: stretch;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .cat-strip-inner::-webkit-scrollbar { display: none; }

    .cat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px 28px;
      background: none;
      border: none;
      border-right: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: color 0.2s, background 0.2s;
      flex-shrink: 0;
      position: relative;
    }

    .cat-pill::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; right: 50%;
      height: 2px;
      background: var(--accent);
      transition: left 0.25s ease, right 0.25s ease;
    }

    .cat-pill:hover { color: var(--text-primary); background: var(--bg-2); }
    .cat-pill:hover::after { left: 0; right: 0; }

    .cat-pill--all {
      color: var(--accent);
      background: var(--accent-dim);
      border-right: none;
    }

    .cat-pill--all:hover { background: var(--accent); color: #fff; }
    .cat-pill--all:hover::after { display: none; }

    .cat-pill-icon { font-size: 22px; }

    .cat-pill-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }

    /* ═══════════════════════════════
       STATS
    ═══════════════════════════════ */
    .stats-section { padding: 60px 0 20px; }

    .stats-grid {
      display: flex;
      align-items: stretch;
      background: var(--bg-2);
      border: 1px solid var(--border);
    }

    .stat-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 36px 24px;
    }

    .stat-value {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2.6rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .stat-suffix { color: var(--accent); font-size: 1.6rem; }

    .stat-label {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      color: var(--text-tertiary);
      font-weight: 400;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .stat-divider { width: 1px; background: var(--border); flex-shrink: 0; align-self: stretch; }

    /* ═══════════════════════════════
       SONY FEATURED HERO
    ═══════════════════════════════ */
    .sony-hero {
      background: var(--bg-1);
      border-top: 1px solid var(--border);
      overflow: hidden;
    }

    .sony-hero-inner {
      display: flex;
      max-width: 1440px;
      margin: 0 auto;
      min-height: 78vh;
      align-items: stretch;
    }

    .sony-hero-visual {
      flex: 0 0 50%;
      background: var(--bg-2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      overflow: hidden;
      position: relative;
    }

    .sony-hero-visual::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 60% 50%, rgba(200,16,46,0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .sony-hero-img {
      width: 100%;
      max-height: 60vh;
      object-fit: contain;
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
      z-index: 1;
    }

    .sony-hero-visual:hover .sony-hero-img { transform: scale(1.04); }

    .sony-hero-content {
      flex: 0 0 50%;
      padding: 60px 80px 60px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .sony-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .sony-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2.6rem, 4.5vw, 4.4rem);
      font-weight: 800;
      color: var(--text-primary);
      text-transform: uppercase;
      line-height: 0.95;
      letter-spacing: -0.01em;
      margin: 0 0 20px;
    }

    .sony-desc {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 20px;
      max-width: 420px;
    }

    .sony-price {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-primary);
      display: block;
      letter-spacing: -0.02em;
      line-height: 1;
      margin-bottom: 36px;
    }

    .sony-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-bright);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      transition: all 0.25s ease;
      align-self: flex-start;
      margin-bottom: 40px;
    }

    .sony-cta:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      box-shadow: 0 4px 28px var(--accent-glow);
    }

    .sony-cta .material-icons { font-size: 15px; transition: transform 0.25s; }
    .sony-cta:hover .material-icons { transform: translateX(4px); }

    .sony-nav { display: flex; gap: 10px; align-items: center; }

    .sony-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      border: 1px solid var(--text-tertiary);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
    }

    .sony-dot.is-active {
      background: var(--accent);
      border-color: var(--accent);
      transform: scale(1.4);
    }

    .sony-dot:hover { border-color: var(--text-primary); }

    /* ═══════════════════════════════
       VIDEO REVEAL
    ═══════════════════════════════ */
    .video-reveal-section {
      height: 500vh;
      position: relative;
      background: #000;
    }

    .video-reveal-sticky {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .video-reveal-media {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .video-reveal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.35);
      pointer-events: none;
    }

    .video-reveal-texts {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      pointer-events: none;
      z-index: 2;
    }

    .vr-bg-layer {
      grid-area: 1/1;
      width: 90%;
      max-width: 720px;
      padding: 40px 48px;
      background: var(--bg-0);
      opacity: 0;
      pointer-events: none;
    }

    .vr-group {
      grid-area: 1/1;
      width: 100%;
      max-width: 800px;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .vr-title {
      margin: 0;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(40px, 6vw, 80px);
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      line-height: 0.95;
      opacity: 0;
    }

    .vr-desc {
      margin: 20px auto 0;
      font-family: 'Outfit', sans-serif;
      font-size: clamp(14px, 1.5vw, 20px);
      color: rgba(255,255,255,0.7);
      max-width: 480px;
      line-height: 1.6;
      opacity: 0;
    }

    /* ═══════════════════════════════
       APPLE TV SHOWCASE
    ═══════════════════════════════ */
    .tv-showcase {
      background: #080808;
      padding: 100px 24px;
      border-top: 1px solid var(--border);
      overflow: hidden;
    }

    .tv-showcase-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tv-showcase-heading {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2.4rem, 5vw, 5rem);
      font-weight: 800;
      text-transform: uppercase;
      text-align: center;
      color: #fff;
      line-height: 0.92;
      letter-spacing: -0.01em;
      margin: 0 0 70px;
      max-width: 700px;
    }

    .tv-showcase-row {
      display: flex;
      align-items: center;
      gap: 80px;
      width: 100%;
    }

    .tv-showcase-left { flex: 0 0 55%; }

    .tv-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
      transition: transform 0.15s ease-out;
      transform-origin: center;
      will-change: transform;
    }

    .tv-img { width: 100%; display: block; }

    .tv-screen {
      position: absolute;
      top: 4.5%; left: 3.5%;
      width: 93%; height: 79%;
      object-fit: cover;
      z-index: 1;
    }

    .tv-showcase-right { flex: 1; }

    .tv-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .tv-right-heading {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(1.8rem, 3vw, 3rem);
      font-weight: 800;
      text-transform: uppercase;
      color: #fff;
      line-height: 0.95;
      letter-spacing: -0.01em;
      margin: 0 0 20px;
    }

    .tv-right-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      line-height: 1.7;
      color: rgba(255,255,255,0.5);
      max-width: 380px;
      margin: 0 0 32px;
    }

    .tv-right-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.18);
      color: #fff;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      transition: all 0.25s;
    }

    .tv-right-cta:hover {
      background: var(--accent);
      border-color: var(--accent);
      box-shadow: 0 4px 24px var(--accent-glow);
    }

    .tv-right-cta .material-icons { font-size: 14px; transition: transform 0.25s; }
    .tv-right-cta:hover .material-icons { transform: translateX(4px); }

    /* ═══════════════════════════════
       HEADPHONES SHOWCASE
    ═══════════════════════════════ */
    .hp-showcase {
      padding: 100px 24px;
      background: var(--bg-2);
      border-top: 1px solid var(--border);
      overflow: hidden;
    }

    .hp-showcase-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 80px;
    }

    .hp-showcase-left { flex: 0 0 50%; }

    .headphones-wrapper {
      width: 100%;
      transition: transform 0.15s ease-out;
      transform-origin: center;
      will-change: transform;
    }

    .headphones-wrapper img {
      width: 100%;
      display: block;
      object-fit: contain;
    }

    .hp-showcase-right { flex: 1; }

    .hp-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .hp-heading {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2.4rem, 4vw, 4rem);
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-primary);
      line-height: 0.95;
      letter-spacing: -0.01em;
      margin: 0 0 20px;
    }

    .hp-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--text-secondary);
      max-width: 400px;
      margin: 0 0 32px;
    }

    .hp-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      background: var(--accent);
      border: none;
      color: #fff;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.3s, transform 0.2s;
    }

    .hp-cta:hover {
      background: var(--accent-hover);
      box-shadow: 0 4px 28px var(--accent-glow);
      transform: translateY(-2px);
    }

    .hp-cta .material-icons { font-size: 15px; transition: transform 0.25s; }
    .hp-cta:hover .material-icons { transform: translateX(4px); }

    /* ═══════════════════════════════
       PERKS
    ═══════════════════════════════ */
    .perks-list { display: flex; flex-direction: column; gap: 8px; margin-top: 2rem; }

    .perk-item {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 18px 16px;
      border: 1px solid transparent;
      border-left: 2px solid transparent;
      transition: all 0.25s ease;
    }

    .perk-item:hover {
      background: var(--bg-2);
      border-color: var(--border);
      border-left-color: var(--accent);
    }

    .perk-icon-wrap {
      width: 48px; height: 48px;
      background: var(--accent-dim);
      border: 1px solid var(--accent-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.25s;
    }

    .perk-item:hover .perk-icon-wrap { background: var(--accent); border-color: var(--accent); }
    .perk-icon-wrap .material-icons { font-size: 22px; color: var(--accent); transition: color 0.25s; }
    .perk-item:hover .perk-icon-wrap .material-icons { color: #fff; }

    .perk-body h4 {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 3px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .perk-body p {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 0;
    }

    /* ═══════════════════════════════
       CTA
    ═══════════════════════════════ */
    .cta-section {
      position: relative;
      text-align: center;
      padding: 120px 0 100px;
      background: var(--bg-0);
      overflow: hidden;
    }

    .cta-accent-line {
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 1px; height: 80px;
      background: linear-gradient(to bottom, transparent, var(--accent));
    }

    .cta-inner { position: relative; z-index: 1; }

    .cta-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .cta-eyebrow::before, .cta-eyebrow::after {
      content: '';
      display: inline-block;
      width: 24px; height: 1px;
      background: var(--accent);
      opacity: 0.6;
    }

    .cta-heading {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(2.4rem, 5.5vw, 4rem);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cta-heading em { font-style: normal; color: var(--accent); }

    .cta-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      color: var(--text-secondary);
      max-width: 480px;
      margin: 0 auto 48px;
      line-height: 1.7;
    }

    .cta-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .cta-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 15px 36px;
      background: var(--accent);
      color: #fff;
      border: none;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.3s, transform 0.2s;
    }

    .cta-btn-primary:hover {
      background: var(--accent-hover);
      box-shadow: 0 6px 32px var(--accent-glow);
      transform: translateY(-2px);
    }

    .cta-btn-primary .material-icons { font-size: 17px; }

    .cta-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-bright);
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cta-btn-secondary:hover {
      color: var(--text-primary);
      border-color: var(--accent-border);
      background: var(--accent-dim);
    }

    .cta-btn-secondary .material-icons { font-size: 15px; transition: transform 0.25s; }
    .cta-btn-secondary:hover .material-icons { transform: translateX(4px); }

    /* ═══════════════════════════════
       RESPONSIVE
    ═══════════════════════════════ */
    @media (max-width: 768px) {
      .cinema-slider { height: 78vh; min-height: 480px; }
      .frame-heading { font-size: 2.4rem; }
      .frame-sub { font-size: 0.9rem; }
      .frame-actions { flex-direction: column; align-items: flex-start; gap: 16px; }
      .slider-nav { bottom: 1.5rem; gap: 14px; }
      .scroll-hint { display: none; }
      .stats-grid { flex-direction: column; gap: 0; }
      .stat-divider { width: 100%; height: 1px; align-self: auto; }
      .deco-block--a, .deco-grid { display: none; }

      .sony-hero-inner { flex-direction: column; min-height: auto; }
      .sony-hero-visual { width: 100%; padding: 40px 24px; }
      .sony-hero-content { width: 100%; padding: 40px 24px 60px; }
      .sony-desc { max-width: 100%; }
      .sony-cta { align-self: stretch; justify-content: center; }

      .tv-showcase { padding: 60px 16px; }
      .tv-showcase-row { flex-direction: column; gap: 40px; }
      .tv-showcase-left { width: 100%; flex: none; }
      .tv-showcase-right { text-align: center; }
      .tv-right-text { max-width: 100%; }
      .tv-eyebrow { justify-content: center; }
      .tv-right-cta { align-self: center; }
      .tv-showcase-heading { font-size: 2.4rem; margin-bottom: 40px; }

      .hp-showcase { padding: 60px 16px; }
      .hp-showcase-inner { flex-direction: column-reverse; gap: 40px; }
      .hp-showcase-left { width: 100%; flex: none; }
      .hp-showcase-right { text-align: center; }
      .hp-eyebrow { justify-content: center; }
      .hp-cta { align-self: center; }

      .cta-section { padding: 80px 0 60px; }
    }

    @media (max-width: 480px) {
      .cinema-slider { height: 88vh; }
      .frame-price { font-size: 1.8rem; }
      .cta-heading { font-size: 1.9rem; }
      .sony-title { font-size: 2rem; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  featuredProducts: Product[] = [];
  featuredIndex = 0;
  latestProducts: Product[] = [];
  activeSlide = 0;
  sliderLoaded = false;
  private autoSlideTimer: any;
  private gsapCtx: (() => void) | null = null;
  private onScrollFn: (() => void) | null = null;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHeroProducts();
    // Top 6 by price → flagship devices for the featured sections
    this.api.getProductsPaginated(0, 6, undefined, undefined, undefined, 'price', 'desc').subscribe({
      next: res => { this.featuredProducts = res.data.content; },
      error: () => this.snackBar.open('Failed to load products', 'Close', { duration: 3000 })
    });
  }

  ngAfterViewInit(): void {
    for (const id of ['reveal-video', 'tv-screen-video']) {
      const v = document.getElementById(id) as HTMLVideoElement;
      if (v) { v.muted = true; v.play().catch(() => {}); }
    }
    this.setupScrollScale();
    this.setupVideoReveal();
  }

  private setupScrollScale(): void {
    const getScale = (el: HTMLElement): number => {
      const rect = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(center - elCenter);
      return Math.max(0.88, 1 - (dist / window.innerHeight) * 0.22);
    };

    this.onScrollFn = () => {
      const tv = document.querySelector('.tv-wrapper') as HTMLElement;
      const hp = document.querySelector('.headphones-wrapper') as HTMLElement;
      if (tv) tv.style.transform = `scale(${getScale(tv)})`;
      if (hp) hp.style.transform = `scale(${getScale(hp)})`;
    };

    window.addEventListener('scroll', this.onScrollFn, { passive: true });
    this.onScrollFn();
  }

  private setupVideoReveal(): void {
    if (typeof window === 'undefined') return;
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const section = document.getElementById('video-reveal');
        const els = {
          t1: document.getElementById('title1'), d1: document.getElementById('desc1'),
          g1: document.getElementById('group1'), t2: document.getElementById('title2'),
          d2: document.getElementById('desc2'), g2: document.getElementById('group2'),
          t3: document.getElementById('title3'), d3: document.getElementById('desc3'),
          g3: document.getElementById('group3'), bg: document.getElementById('text-bg'),
        };

        if (!section || Object.values(els).some(e => !e)) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
          },
          defaults: { ease: 'none' },
        });

        tl.fromTo(els.bg, { opacity: 0 }, { opacity: 0.10, duration: 0.30 }, 0);
        tl.to(els.bg, { opacity: 0.20, duration: 0.20 }, 0.30);
        tl.to(els.bg, { opacity: 0.30, duration: 0.30 }, 0.50);
        tl.to(els.bg, { opacity: 0.40, duration: 0.20 }, 0.80);

        tl.fromTo(els.t1, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0);
        tl.fromTo(els.d1, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.10);
        tl.to(els.g1, { y: -60, opacity: 0, duration: 0.10 }, 0.20);

        tl.fromTo(els.t2, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.10 }, 0.30);
        tl.fromTo(els.d2, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.40);
        tl.to(els.g2, { y: -60, opacity: 0, duration: 0.10 }, 0.50);

        tl.fromTo(els.t3, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.10 }, 0.60);
        tl.fromTo(els.d3, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.70);
        tl.to(els.g3, { y: -60, opacity: 0, duration: 0.10 }, 0.80);

        tl.to(section, { opacity: 0, duration: 0.10 }, 0.90);

        this.gsapCtx = () => {
          ScrollTrigger.getAll().forEach((st: any) => st.kill());
          tl.kill();
        };
      });
    });
  }

  private loadHeroProducts(): void {
    // Cinema slider shows the 3 most premium products (sorted by price DESC)
    this.api.getProductsPaginated(0, 3, undefined, undefined, undefined, 'price', 'desc').subscribe({
      next: res => {
        this.latestProducts = res.data.content;
        this.sliderLoaded = true;
        this.playActiveVideo();
        this.startAutoSlide();
      },
      error: () => { this.sliderLoaded = true; }
    });
  }

  private startAutoSlide(): void {
    this.autoSlideTimer = setInterval(() => this.nextSlide(), 6000);
  }

  nextSlide(): void {
    this.pauseAllVideos();
    this.activeSlide = (this.activeSlide + 1) % this.latestProducts.length;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  prevSlide(): void {
    this.pauseAllVideos();
    this.activeSlide = (this.activeSlide - 1 + this.latestProducts.length) % this.latestProducts.length;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  goToSlide(index: number): void {
    this.pauseAllVideos();
    this.activeSlide = index;
    this.playActiveVideo();
    this.resetAutoSlide();
  }

  private playActiveVideo(): void {
    setTimeout(() => {
      document.querySelectorAll('.frame-media').forEach((el, i) => {
        const v = el as HTMLVideoElement;
        if (v.tagName === 'VIDEO') {
          if (i === this.activeSlide) { v.currentTime = 0; v.play().catch(() => {}); }
          else v.pause();
        }
      });
    }, 300);
  }

  private pauseAllVideos(): void {
    document.querySelectorAll('.frame-media').forEach(el => {
      if ((el as HTMLVideoElement).tagName === 'VIDEO') (el as HTMLVideoElement).pause();
    });
  }

  private resetAutoSlide(): void {
    clearInterval(this.autoSlideTimer);
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideTimer);
    if (this.onScrollFn) window.removeEventListener('scroll', this.onScrollFn);
    this.pauseAllVideos();
    if (this.gsapCtx) this.gsapCtx();
  }

  goToProducts(): void { this.router.navigate(['/products']); }
  goToProduct(id: number): void { this.router.navigate(['/products', id]); }
  goToCategory(name: string): void { this.router.navigate(['/categories', name]); }
}
