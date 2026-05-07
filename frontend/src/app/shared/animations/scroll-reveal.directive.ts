import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ScrollAnimationService } from './scroll-animation.service';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() appScrollReveal: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right' | 'parallax' = 'fade-up';
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.1;

  private initialTransform = 'translateY(60px)';
  private initialStyles: Record<string, string> = {};

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit() {
    this.initialStyles = {
      opacity: '0',
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}s`,
    };

    switch (this.appScrollReveal) {
      case 'fade-up':
        this.initialTransform = 'translateY(60px)';
        break;
      case 'scale-up':
        this.initialTransform = 'scale(0.9)';
        break;
      case 'slide-left':
        this.initialTransform = 'translateX(-80px)';
        break;
      case 'slide-right':
        this.initialTransform = 'translateX(80px)';
        break;
      case 'parallax':
        this.initialStyles['willChange'] = 'transform';
        this.initialTransform = 'none';
        break;
      case 'fade-in':
      default:
        this.initialTransform = 'none';
        break;
    }

    for (const [prop, value] of Object.entries(this.initialStyles)) {
      this.renderer.setStyle(this.el.nativeElement, prop, value);
    }

    this.applyInitial();

    this.scrollService.observe(this.el.nativeElement, (progress) => {
      if (progress >= this.revealThreshold) {
        this.reveal();
      } else {
        this.applyInitial();
      }
    });

    if (this.appScrollReveal === 'parallax') {
      this.setupParallax();
    }
  }

  private applyInitial() {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', this.initialTransform);
  }

  private reveal() {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0) scale(1) translateX(0)');
  }

  private setupParallax() {
    const onScroll = () => {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const yOffset = (scrollPercent - 0.5) * 40;
      this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(${yOffset}px)`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  ngOnDestroy() {
    this.scrollService.unobserve(this.el.nativeElement);
  }
}
