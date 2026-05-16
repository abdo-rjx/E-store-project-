import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StickySectionComponent } from '../../shared/components/sticky-section/sticky-section.component';
import { ScrollRevealDirective } from '../../shared/animations/scroll-reveal.directive';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    StickySectionComponent,
    ScrollRevealDirective,
  ],
  template: `
    <!-- CINEMATIC VIDEO SLIDER -->
    <section class="cinema-slider">
      <div class="slider-frames" [class.active]="sliderLoaded">
        @for (product of latestProducts; track product.id; let i = $index) {
          <article class="slide-frame" [class.is-active]="i === activeSlide"
                   [attr.aria-hidden]="i !== activeSlide">
            @if (product.videoPath) {
              <video
                [src]="product.videoPath"
                muted
                [muted]="true"
                loop
                [autoplay]="i === activeSlide"
                [playsInline]="true"
                class="frame-video"
                #slideVideos
              ></video>
            } @else {
              <img [src]="product.imagePaths?.[0] || product.imageUrl" [alt]="product.name" class="frame-image">
            }
            <div class="frame-vignette"></div>
            <div class="frame-grain"></div>
            <div class="frame-content">
              <span class="frame-label">N° {{ i + 1 }} — New Arrival</span>
              <h2 class="frame-heading">{{ product.name }}</h2>
              <p class="frame-excerpt">{{ product.description }}</p>
              <div class="frame-actions">
                <button class="btn-cinema" (click)="goToProduct(product.id)">
                  <span class="btn-cinema-label">Discover</span>
                  <span class="btn-cinema-arrow">
                    <span class="material-icons">arrow_forward</span>
                  </span>
                </button>
                <span class="frame-price">\${{ product.price | number:'1.2-2' }}</span>
              </div>
            </div>
          </article>
        }
      </div>

      @if (latestProducts.length > 1) {
        <nav class="slider-nav" aria-label="Slide navigation">
          <button class="nav-chevron nav-chevron--prev" (click)="prevSlide()" aria-label="Previous slide">
            <span class="material-icons">chevron_left</span>
          </button>
          <div class="nav-progress">
            @for (p of latestProducts; track p.id; let i = $index) {
              <button class="nav-dot" [class.is-current]="i === activeSlide" (click)="goToSlide(i)" [attr.aria-label]="'Go to slide ' + (i + 1)">
                <span class="nav-dot-fill"></span>
              </button>
            }
          </div>
          <button class="nav-chevron nav-chevron--next" (click)="nextSlide()" aria-label="Next slide">
            <span class="material-icons">chevron_right</span>
          </button>
        </nav>
      }
    </section>

    <!-- FEATURED PRODUCTS -->
    @if (featuredProducts.length > 0) {
      <section class="sony-hero">
        <div class="sony-hero-inner">
          <div class="sony-hero-visual">
            <img [src]="featuredProducts[featuredIndex].imagePaths?.[0] || featuredProducts[featuredIndex].imageUrl"
                 [alt]="featuredProducts[featuredIndex].name" class="sony-hero-img" />
          </div>
          <div class="sony-hero-content">
            <span class="sony-hero-suptitle">Featured</span>
            <h2 class="sony-hero-title">{{ featuredProducts[featuredIndex].name }}</h2>
            <p class="sony-hero-desc">{{ featuredProducts[featuredIndex].description }}</p>
            <span class="sony-hero-price">\${{ featuredProducts[featuredIndex].price | number:'1.2-2' }}</span>
            <button class="sony-hero-cta" (click)="goToProduct(featuredProducts[featuredIndex].id)">Shop Now</button>
            @if (featuredProducts.length > 1) {
              <div class="sony-hero-nav">
                @for (p of featuredProducts; track p.id; let i = $index) {
                  <button class="sony-hero-dot"
                          [class.is-active]="i === featuredIndex"
                          (click)="featuredIndex = i"
                          [attr.aria-label]="'View ' + p.name"></button>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- SCROLL-PINNED VIDEO REVEAL -->
    <section class="video-reveal-section" id="video-reveal">
      <div class="video-reveal-sticky" id="video-sticky">
        <video
          src="/uploads/tt4.mp4"
          muted
          loop
          playsinline
          autoplay
          preload="auto"
          class="video-reveal-media"
          id="reveal-video"
        ></video>

        <div class="video-reveal-texts">
          <div class="vr-bg-layer" id="text-bg"></div>
          <div class="vr-group" id="group1">
            <h2 class="vr-title" id="title1">[placeholder title 1]</h2>
            <p class="vr-desc" id="desc1">[placeholder description 1]</p>
          </div>
          <div class="vr-group" id="group2">
            <h2 class="vr-title" id="title2">[placeholder title 2]</h2>
            <p class="vr-desc" id="desc2">[placeholder description 2]</p>
          </div>
          <div class="vr-group" id="group3">
            <h2 class="vr-title" id="title3">[placeholder title 3]</h2>
            <p class="vr-desc" id="desc3">[placeholder description 3]</p>
          </div>
        </div>
      </div>
    </section>

    <!-- APPLE TV SHOWCASE -->
    <!-- APPLE TV SHOWCASE -->
    <section class="apple-tv-section tv-section" appScrollReveal="fade-up">
      <h2 class="apple-tv-heading">
        Watch, sing, play, and work out.<br>
        On the big screen.
      </h2>

      <div class="apple-tv-row">
        <div class="apple-tv-left">
          <div class="tv-wrapper">
            <img src="/uploads/images/Chat.png" alt="TV" class="tv-img">
            <video class="tv-screen" id="tv-screen-video" autoplay muted loop playsinline>
              <source src="/uploads/videos/tvideo.mp4" type="video/mp4">
            </video>
          </div>
        </div>

        <div class="apple-tv-right">
          <h3 class="tv-right-heading">Premium Entertainment</h3>
          <p class="tv-right-text">
            Our store offers the latest TVs with the best quality, the most stunning display,
            and a full satisfaction guarantee. Experience cinema at home.
          </p>
        </div>
      </div>
    </section>

    <!-- HEADPHONES SHOWCASE -->
    <section class="headphones-section" id="headphones-section">
      <div class="headphones-row">
        <div class="headphones-left">
          <div class="headphones-wrapper">
            <img src="/uploads/images/kk.png" alt="Three headphone colors" />
          </div>
        </div>
        <div class="headphones-right">
          <h2 class="hp-heading">Elevate your listening experience</h2>
          <p class="hp-text">Premium sound in three signature colors. ANC, 40h battery, studio-grade audio.</p>
          <a href="#" class="hp-btn">Shop now</a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="editorial-cta" appScrollReveal="fade-up">
      <div class="cta-grain"></div>
      <div class="cta-content">
        <span class="cta-label">Ready to Upgrade?</span>
        <h2>Join thousands of satisfied customers who trust us for their tech needs.</h2>
        <button class="btn-cinema btn-cinema--light" (click)="goToProducts()">
          <span class="btn-cinema-label">Browse Full Catalog</span>
          <span class="btn-cinema-arrow">
            <span class="material-icons">arrow_forward</span>
          </span>
        </button>
      </div>
    </section>

    <!-- WHY CHOOSE US -->
    <app-sticky-section
      label="WHY CHOOSE US"
      title="An Experience, Not Just a Store"
      description="Free shipping on all orders, 24/7 dedicated support, and a 30-day hassle-free return policy. Your satisfaction is our priority."
      gradient="linear-gradient(135deg, #1a1a2e 0%, #533483 100%)"
      layout="right"
      appScrollReveal="fade-up"
    >
      <div content class="perks-list">
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.1">
          <span class="material-icons perk-icon">local_shipping</span>
          <div class="perk-body">
            <h4>Free Express Shipping</h4>
            <p>On all orders, no minimum required</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.2">
          <span class="material-icons perk-icon">support_agent</span>
          <div class="perk-body">
            <h4>24/7 Expert Support</h4>
            <p>Real people, real solutions</p>
          </div>
        </div>
        <div class="perk-item" appScrollReveal="slide-right" [revealDelay]="0.3">
          <span class="material-icons perk-icon">replay</span>
          <div class="perk-body">
            <h4>30-Day Returns</h4>
            <p>No questions asked, full refund</p>
          </div>
        </div>
      </div>
    </app-sticky-section>
  `,
  styles: [`
    /* ---- CINEMA SLIDER ---- */
    .cinema-slider {
      position: relative;
      height: 92vh;
      min-height: 560px;
      overflow: hidden;
      background: #050505;
    }

    .slider-frames {
      position: relative;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.8s ease;
    }

    .slider-frames.active { opacity: 1; }

    .slide-frame {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
    }

    .slide-frame.is-active { opacity: 1; }

    .frame-video, .frame-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.03);
      transition: transform 8s ease;
    }

    .slide-frame.is-active .frame-video,
    .slide-frame.is-active .frame-image {
      transform: scale(1);
    }

    .frame-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(5, 5, 5, 0.85) 0%,
        rgba(5, 5, 5, 0.4) 45%,
        rgba(5, 5, 5, 0.1) 100%
      );
    }

    .frame-grain {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .frame-content {
      position: relative;
      z-index: 2;
      max-width: 620px;
      padding: 0 5rem;
      transform: translateY(24px);
      opacity: 0;
      transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.4s;
    }

    .slide-frame.is-active .frame-content {
      transform: translateY(0);
      opacity: 1;
    }

    .frame-label {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(234, 156, 72, 0.12);
      border: 1px solid rgba(234, 156, 72, 0.3);
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      margin-bottom: 20px;
      font-family: 'DM Sans', sans-serif;
    }

    .frame-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.2rem, 5.5vw, 4rem);
      font-weight: 700;
      color: #fff;
      line-height: 1.08;
      letter-spacing: -0.02em;
      margin-bottom: 18px;
    }

    .frame-excerpt {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.7;
      margin-bottom: 36px;
      max-width: 500px;
    }

    .frame-actions {
      display: flex;
      align-items: center;
      gap: 28px;
      flex-wrap: wrap;
    }

    .btn-cinema {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 36px;
      border-radius: var(--radius-pill);
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: 'DM Sans', sans-serif;
      background: var(--accent-gradient);
      color: #fff;
      box-shadow: 0 4px 24px var(--accent-primary-glow);
    }

    .btn-cinema--light {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      box-shadow: none;
    }

    .btn-cinema:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-cinema--light:hover {
      border-color: var(--accent-primary);
      background: var(--accent-primary-glow);
      box-shadow: 0 4px 20px var(--accent-primary-glow);
    }

    .btn-cinema-arrow .material-icons {
      font-size: 18px;
      transition: transform 0.3s;
    }

    .btn-cinema:hover .btn-cinema-arrow .material-icons {
      transform: translateX(4px);
    }

    .frame-price {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #fff;
    }

    /* SLIDER NAV */
    .slider-nav {
      position: absolute;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 10;
    }

    .nav-chevron {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-chevron:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: scale(1.08);
    }

    .nav-progress {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .nav-dot {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .nav-dot.is-current {
      width: 48px;
      background: var(--accent-primary);
    }

    .nav-dot-fill {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* PERKS */
    .perks-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .perk-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: var(--radius-md);
      transition: background 0.3s ease;
    }

    .perk-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .perk-icon {
      font-size: 26px;
      color: var(--accent-primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .perk-body h4 {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 0.3rem;
    }

    .perk-body p {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    /* EDITORIAL CTA */
    .editorial-cta {
      position: relative;
      text-align: center;
      padding: 10rem 2rem 8rem;
      overflow: hidden;
    }

    .cta-grain {
      position: absolute;
      inset: 0;
      opacity: 0.02;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .cta-content {
      position: relative;
      z-index: 1;
    }

    .cta-label {
      font-family: 'Playfair Display', serif;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-primary);
      text-transform: uppercase;
      display: block;
      margin-bottom: 16px;
    }

    .editorial-cta h2 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 2.5rem;
      max-width: 640px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ---- SONY-STYLE FEATURED HERO ---- */
    .sony-hero {
      background: var(--bg-secondary);
      padding: 0;
      overflow: hidden;
      transition: background-color 0.3s ease;
    }

    .sony-hero-inner {
      display: flex;
      flex-direction: row;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 80vh;
    }

    .sony-hero-visual {
      flex: 0 0 50%;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    .sony-hero-img {
      width: 100%;
      height: auto;
      max-height: 70vh;
      object-fit: contain;
      display: block;
    }

    .sony-hero-content {
      flex: 0 0 50%;
      padding: 48px 64px 48px 48px;
    }

    .sony-hero-suptitle {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      display: block;
      margin-bottom: 16px;
    }

    .sony-hero-title {
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(2.4rem, 4vw, 3.6rem);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.1;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
    }

    .sony-hero-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 24px;
      max-width: 440px;
    }

    .sony-hero-price {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      display: block;
      margin-bottom: 32px;
    }

    .sony-hero-cta {
      display: inline-flex;
      align-items: center;
      padding: 14px 36px;
      border: 2px solid var(--text-primary);
      border-radius: 0;
      background: transparent;
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .sony-hero-cta:hover {
      background: var(--text-primary);
      color: var(--bg-primary);
    }

    .sony-hero-nav {
      display: flex;
      gap: 12px;
      margin-top: 48px;
    }

    .sony-hero-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--text-tertiary);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
    }

    .sony-hero-dot.is-active {
      background: var(--text-primary);
      border-color: var(--text-primary);
    }

    .sony-hero-dot:hover {
      border-color: var(--text-primary);
    }

    /* ---- SCROLL-PINNED VIDEO REVEAL ---- */
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
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
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
      grid-area: 1 / 1;
      width: 90%;
      max-width: 720px;
      padding: 40px 48px;
      border-radius: 24px;
      background: var(--bg-primary);
      opacity: 0;
      pointer-events: none;
    }

    .vr-group {
      grid-area: 1 / 1;
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
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(40px, 5vw, 72px);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      line-height: 1.1;
      opacity: 0;
    }

    .vr-desc {
      margin: 20px auto 0;
      font-size: clamp(14px, 1.5vw, 20px);
      color: var(--text-secondary);
      max-width: 500px;
      line-height: 1.6;
      font-family: 'DM Sans', sans-serif;
      opacity: 0;
    }

    /* ---- APPLE TV SHOWCASE ---- */
    .tv-section {
      background: #111;
    }

    @media (prefers-color-scheme: dark) {
      .tv-section {
        background: #f5f5f7;
      }
    }

    .tv-section h2,
    .tv-section h3,
    .tv-section p {
      color: #fff;
    }

    @media (prefers-color-scheme: dark) {
      .tv-section h2,
      .tv-section h3,
      .tv-section p {
        color: #1a1a1a;
      }
    }

    .apple-tv-section {
      padding: 80px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .apple-tv-heading {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: clamp(28px, 4vw, 48px);
      font-weight: 800;
      line-height: 1.1;
      text-align: center;
      margin: 0 0 48px;
      max-width: 700px;
    }

    .apple-tv-row {
      display: flex;
      align-items: center;
      gap: 64px;
      width: 100%;
      max-width: 1100px;
    }

    .apple-tv-left {
      flex: 0 0 auto;
      width: 55%;
      max-width: 640px;
    }

    .apple-tv-right {
      flex: 1;
      text-align: left;
    }

    .tv-right-heading {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: clamp(28px, 3vw, 40px);
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 20px;
    }

    .tv-right-text {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: clamp(15px, 1.4vw, 18px);
      line-height: 1.7;
      max-width: 440px;
      margin: 0;
    }

    .tv-wrapper {
      position: relative;
      display: inline-block;
      max-width: 700px;
      width: 100%;
      transition: transform 0.15s ease-out;
      transform-origin: center center;
      will-change: transform;
    }

    .tv-img {
      width: 100%;
      display: block;
    }

    .tv-screen {
      position: absolute;
      top: 4.5%;
      left: 3.5%;
      width: 93%;
      height: 79%;
      object-fit: cover;
      border-radius: 4px;
      z-index: 1;
    }

    /* ---- HEADPHONES SHOWCASE ---- */
    .headphones-section {
      padding: 80px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #111;
      color: #fff;
    }

    @media (prefers-color-scheme: dark) {
      .headphones-section {
        background: #f5f5f7;
        color: #1a1a1a;
      }
    }

    .headphones-row {
      display: flex;
      align-items: center;
      gap: 64px;
      width: 100%;
      max-width: 1100px;
    }

    .headphones-left {
      flex: 0 0 auto;
      width: 50%;
      max-width: 560px;
    }

    .headphones-wrapper {
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      transition: transform 0.15s ease-out;
      transform-origin: center center;
      will-change: transform;
    }

    .headphones-wrapper img {
      width: 100%;
      display: block;
      object-fit: contain;
      background: transparent;
    }

    .headphones-right {
      flex: 1;
      text-align: left;
    }

    .hp-heading {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: clamp(28px, 3vw, 40px);
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 20px;
    }

    .hp-text {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: clamp(15px, 1.4vw, 18px);
      line-height: 1.7;
      max-width: 440px;
      margin: 0 0 28px;
    }

    .hp-btn {
      display: inline-block;
      padding: 12px 32px;
      border: 1.5px solid currentColor;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      color: inherit;
      transition: all 0.25s ease;
    }

    .hp-btn:hover {
      background: currentColor;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .sony-hero-inner {
        flex-direction: column;
        min-height: auto;
      }

      .sony-hero-visual {
        flex: none;
        width: 100%;
        padding: 32px;
      }

      .sony-hero-content {
        flex: none;
        width: 100%;
        padding: 0 32px 48px;
        text-align: center;
      }

      .sony-hero-desc {
        max-width: 100%;
      }

      .sony-hero-nav {
        justify-content: center;
      }
    @media (max-width: 768px) {
      .cinema-slider {
        height: 72vh;
        min-height: 460px;
      }

      .frame-content {
        padding: 0 2rem;
        max-width: 100%;
      }

      .frame-heading {
        font-size: 2rem;
      }

      .frame-excerpt {
        font-size: 0.9rem;
      }

      .frame-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
      }

      .slider-nav {
        bottom: 1.5rem;
        gap: 12px;
      }

      .nav-chevron {
        width: 36px;
        height: 36px;
      }

      .apple-tv-section {
        padding: 48px 16px;
      }

      .apple-tv-row {
        flex-direction: column;
        gap: 40px;
      }

      .apple-tv-left {
        width: 100%;
        max-width: 500px;
      }

      .apple-tv-right {
        text-align: center;
      }

      .tv-right-text {
        max-width: 100%;
      }

      .editorial-cta {
        padding: 6rem 1.5rem 5rem;
      }

      .editorial-cta h2 {
        font-size: 1.8rem;
      }
    }
  `],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  featuredProducts: Product[] = [];
  featuredIndex = 0;
  latestProducts: Product[] = [];
  activeSlide = 0;
  sliderLoaded = false;
  private autoSlideTimer: any;
  private gsapCtx: any = null;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLatestProducts();
    this.api.getProductsPaginated(0, 6).subscribe({
      next: (res) => {
        this.featuredProducts = res.data.content;
      },
      error: () => this.snackBar.open('Failed to load products', 'Close', { duration: 3000 }),
    });
  }

  private loadLatestProducts(): void {
    this.api.getLatestProducts().subscribe({
      next: (res) => {
        this.latestProducts = res.data;
        this.sliderLoaded = true;
        this.playActiveVideo();
        this.startAutoSlide();
      },
      error: () => {
        this.sliderLoaded = true;
      }
    });
  }

  ngAfterViewInit(): void {
    // Start all videos immediately — do NOT wait for GSAP
    const videoIds = ['reveal-video', 'tv-screen-video'];
    for (const id of videoIds) {
      const v = document.getElementById(id) as HTMLVideoElement;
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
    }
    this.setupVideoReveal();
    this.setupScrollScale();
  }

  private onScroll: (() => void) | null = null;

  private setupScrollScale(): void {
    const getScaleFactor = (el: HTMLElement): number => {
      const rect = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const distance = Math.abs(center - elCenter);
      const maxDistance = window.innerHeight;
      return Math.max(0.75, 1 - (distance / maxDistance) * 0.4);
    };

    this.onScroll = () => {
      const tvImg = document.querySelector('.tv-wrapper') as HTMLElement;
      const hpWrapper = document.querySelector('.headphones-wrapper') as HTMLElement;
      if (tvImg) tvImg.style.transform = `scale(${getScaleFactor(tvImg)})`;
      if (hpWrapper) hpWrapper.style.transform = `scale(${getScaleFactor(hpWrapper)})`;
    };

    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }

  private setupVideoReveal(): void {
    if (typeof window === 'undefined') return;
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const video = document.getElementById('reveal-video') as HTMLVideoElement;
        const videoReveal = document.getElementById('video-reveal');
        const els = {
          t1: document.getElementById('title1'),
          d1: document.getElementById('desc1'),
          g1: document.getElementById('group1'),
          t2: document.getElementById('title2'),
          d2: document.getElementById('desc2'),
          g2: document.getElementById('group2'),
          t3: document.getElementById('title3'),
          d3: document.getElementById('desc3'),
          g3: document.getElementById('group3'),
          bg: document.getElementById('text-bg'),
        };
        if (!video || !videoReveal || Object.values(els).some((e) => !e)) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: videoReveal,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
          },
          defaults: { ease: 'none' },
        });

        // Text background overlay — gradually reveals theme color behind text
        tl.fromTo(els.bg, { opacity: 0 }, { opacity: 0.08, duration: 0.30 }, 0);
        tl.to(els.bg, { opacity: 0.16, duration: 0.20 }, 0.30);
        tl.to(els.bg, { opacity: 0.24, duration: 0.30 }, 0.50);
        tl.to(els.bg, { opacity: 0.35, duration: 0.20 }, 0.80);

        // STEP 1: Title 1 fades in (center)
        tl.fromTo(els.t1, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0);

        // STEP 2: Paragraph 1 fades in below Title 1
        tl.fromTo(els.d1, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.10);

        // STEP 3: Title 1 + Paragraph 1 slide UP together and disappear
        tl.to(els.g1, { y: -60, opacity: 0, duration: 0.10 }, 0.20);

        // STEP 4: Title 2 slides in from BOTTOM
        tl.fromTo(els.t2, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.10 }, 0.30);

        // STEP 5: Paragraph 2 fades in below Title 2
        tl.fromTo(els.d2, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.40);

        // STEP 6: Title 2 + Paragraph 2 slide UP together and disappear
        tl.to(els.g2, { y: -60, opacity: 0, duration: 0.10 }, 0.50);

        // STEP 7: Title 3 slides in from BOTTOM
        tl.fromTo(els.t3, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.10 }, 0.60);

        // STEP 8: Paragraph 3 fades in below Title 3
        tl.fromTo(els.d3, { opacity: 0 }, { opacity: 1, duration: 0.10 }, 0.70);

        // STEP 9: Title 3 + Paragraph 3 slide UP together and disappear
        tl.to(els.g3, { y: -60, opacity: 0, duration: 0.10 }, 0.80);

        // STEP 10: section fades out
        tl.to(videoReveal, { opacity: 0, duration: 0.10 }, 0.90);

        this.gsapCtx = () => {
          ScrollTrigger.getAll().forEach((st: any) => st.kill());
          tl.kill();
        };
      });
    });
  }

  private startAutoSlide(): void {
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, 6000);
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
      const videos = document.querySelectorAll('.frame-video');
      videos.forEach((video, i) => {
        const v = video as HTMLVideoElement;
        if (i === this.activeSlide) {
          v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, 300);
  }

  private pauseAllVideos(): void {
    const videos = document.querySelectorAll('.frame-video');
    videos.forEach(video => {
      (video as HTMLVideoElement).pause();
    });
  }

  private resetAutoSlide(): void {
    clearInterval(this.autoSlideTimer);
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideTimer);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    this.pauseAllVideos();
    if (this.gsapCtx) this.gsapCtx();
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }
}
