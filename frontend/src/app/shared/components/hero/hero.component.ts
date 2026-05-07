import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationService } from '../../animations/scroll-animation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-stage">
      <div class="hero-canvas" [style.transform]="'scale(' + (1 + progress() * 0.12) + ')'"></div>
      <div class="hero-content">
        <h1 class="hero-heading" [style.opacity]="titleOpacity()" [style.transform]="'translateY(' + titleTranslate() + 'px)'">
          Premium Tech.<br>Unmatched Experience.
        </h1>
        <p class="hero-text" [style.opacity]="subtitleOpacity()" [style.transform]="'translateY(' + subtitleTranslate() + 'px)'">
          Discover flagship devices curated for those who demand excellence.
        </p>
        <div class="hero-actions" [style.opacity]="ctaOpacity()">
          <button class="btn-discover" (click)="scrollToProducts()">
            Explore Collection
          </button>
          <button class="btn-browse" (click)="scrollToProducts()">
            View All Products
          </button>
        </div>
      </div>
      <div class="hero-scroll" [style.opacity]="scrollIndicatorOpacity()">
        <div class="scroll-track"></div>
        <span>Scroll to discover</span>
      </div>
    </section>
  `,
  styles: [`
    .hero-stage {
      position: relative;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-canvas {
      position: absolute;
      inset: -20%;
      background:
        radial-gradient(ellipse at 20% 50%, var(--accent-primary-glow) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(237, 94, 70, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(234, 156, 72, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
      transition: transform 0.1s linear;
      will-change: transform;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 800px;
      padding: 0 2rem;
    }

    .hero-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 1.5rem;
      transition: opacity 0.8s ease, transform 0.8s ease;
    }

    .hero-text {
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2.5rem;
      line-height: 1.7;
      transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      transition: opacity 0.8s ease 0.4s;
    }

    .btn-discover, .btn-browse {
      padding: 0.875rem 2rem;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      border: none;
    }

    .btn-discover {
      background: var(--accent-gradient);
      color: #fff;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
    }

    .btn-discover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--accent-primary-glow);
    }

    .btn-browse {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-browse:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-2px);
    }

    .hero-scroll {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.3s ease;
    }

    .scroll-track {
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.5));
      animation: scrollBreath 2s ease-in-out infinite;
    }

    .hero-scroll span {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    @keyframes scrollBreath {
      0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
      50% { opacity: 1; transform: scaleY(1); }
    }

    @media (max-width: 640px) {
      .hero-content { padding: 0 1rem; }
      .hero-actions { flex-direction: column; align-items: center; }
    }
  `],
})
export class HeroComponent {
  progress = this.scrollService.scrollProgress;

  titleOpacity = computed(() => this.mapProgress(this.progress(), 0, 0.15, 1, 0));
  titleTranslate = computed(() => this.mapProgress(this.progress(), 0, 0.15, 0, -50));
  subtitleOpacity = computed(() => this.mapProgress(this.progress(), 0, 0.2, 0.8, 0));
  subtitleTranslate = computed(() => this.mapProgress(this.progress(), 0, 0.2, 0, -30));
  ctaOpacity = computed(() => this.mapProgress(this.progress(), 0.05, 0.25, 1, 0));
  scrollIndicatorOpacity = computed(() => this.mapProgress(this.progress(), 0, 0.1, 1, 0));

  constructor(private scrollService: ScrollAnimationService) {}

  private mapProgress(p: number, inStart: number, inEnd: number, outStart: number, outEnd: number): number {
    const t = Math.max(0, Math.min(1, (p - inStart) / (inEnd - inStart)));
    return outStart + (outEnd - outStart) * t;
  }

  scrollToProducts() {
    document.querySelector('#products-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}
