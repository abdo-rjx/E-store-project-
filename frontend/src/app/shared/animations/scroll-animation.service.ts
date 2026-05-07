import { Injectable, OnDestroy, NgZone, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollAnimationService implements OnDestroy {
  private observer: IntersectionObserver | null = null;
  private elements = new Map<Element, { callback?: (progress: number) => void; threshold?: number }>();

  scrollProgress = signal(0);
  private scrollHandler: (() => void) | null = null;

  constructor(private zone: NgZone) {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const config = this.elements.get(entry.target);
            if (config?.callback) {
              const progress = entry.intersectionRatio;
              this.zone.run(() => config.callback?.(progress));
            }
          }
        },
        {
          threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '0px 0px -10% 0px'
        }
      );

      this.scrollHandler = () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scrolled / maxScroll : 0;
        this.scrollProgress.set(progress);
      };

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  observe(element: Element, callback?: (progress: number) => void) {
    this.elements.set(element, { callback });
    this.observer?.observe(element);
  }

  unobserve(element: Element) {
    this.observer?.unobserve(element);
    this.elements.delete(element);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
}
