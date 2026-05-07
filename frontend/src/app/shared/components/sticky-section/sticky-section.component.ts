import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sticky-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sticky-stage" [class.reverse]="layout === 'right'">
      <div class="sticky-visual" [style.background]="gradient">
        <ng-content select="[visual]"></ng-content>
        <div class="visual-frame" *ngIf="!hasVisual">
          <div class="frame-screen"></div>
        </div>
      </div>
      <div class="sticky-body">
        <span class="body-label" *ngIf="label">{{ label }}</span>
        <h2 class="body-heading">{{ title }}</h2>
        <p class="body-text">{{ description }}</p>
        <ng-content select="[content]"></ng-content>
      </div>
    </section>
  `,
  styles: [`
    .sticky-stage {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      align-items: center;
      gap: 4rem;
      padding: 4rem;
    }

    .sticky-stage.reverse { direction: rtl; }
    .sticky-stage.reverse > * { direction: ltr; }

    .sticky-visual {
      position: sticky;
      top: 20vh;
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .sticky-body { padding: 2rem 0; }

    .body-label {
      display: inline-block;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent-primary);
      margin-bottom: 1rem;
    }

    .body-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .body-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.7;
      max-width: 480px;
    }

    .visual-frame {
      width: 60%;
      height: 60%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-lg);
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .frame-screen {
      aspect-ratio: 16/10;
      background: linear-gradient(135deg, rgba(234, 156, 72, 0.2), rgba(237, 94, 70, 0.2));
      border-radius: var(--radius-sm);
    }

    @media (max-width: 900px) {
      .sticky-stage {
        grid-template-columns: 1fr;
        padding: 2rem;
        gap: 2rem;
      }

      .sticky-visual {
        position: relative;
        top: auto;
        min-height: 300px;
      }
    }
  `],
})
export class StickySectionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() label = '';
  @Input() layout: 'left' | 'right' = 'left';
  @Input() gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  hasVisual = false;
}
