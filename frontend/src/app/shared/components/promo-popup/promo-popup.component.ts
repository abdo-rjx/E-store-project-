import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PromoService } from '../../../core/services/promo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-promo-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (visible) {
      <div class="popup-overlay" (click)="onOverlayClick($event)">
        <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popup-title">

          <button class="popup-close" (click)="dismiss()" aria-label="Close offer">
            <span class="material-icons">close</span>
          </button>

          <div class="popup-orb popup-orb--a"></div>
          <div class="popup-orb popup-orb--b"></div>

          <div class="popup-badge">
            <span class="material-icons">local_offer</span>
            Exclusive Offer
          </div>

          <h2 class="popup-title" id="popup-title">
            Get <span class="popup-highlight">15% Off</span><br>Your First Order
          </h2>

          <p class="popup-body">
            Sign in now and unlock your welcome discount.<br>Offer expires in:
          </p>

          <div class="popup-timer" aria-label="Time remaining">
            <div class="timer-unit">
              <span class="timer-digit">{{ pad(timerHours) }}</span>
              <span class="timer-label">HRS</span>
            </div>
            <span class="timer-sep">:</span>
            <div class="timer-unit">
              <span class="timer-digit">{{ pad(timerMinutes) }}</span>
              <span class="timer-label">MIN</span>
            </div>
            <span class="timer-sep">:</span>
            <div class="timer-unit">
              <span class="timer-digit">{{ pad(timerSeconds) }}</span>
              <span class="timer-label">SEC</span>
            </div>
          </div>

          <div class="popup-actions">
            <a routerLink="/login" class="btn-popup-primary" (click)="dismiss()">
              <span class="material-icons">login</span>
              Sign In to Claim
            </a>
            <a routerLink="/register" class="btn-popup-secondary" (click)="dismiss()">
              Create Account
            </a>
          </div>

          <p class="popup-footnote">
            Use code <strong>FIRSTSAVE15</strong> at checkout after signing in
          </p>
        </div>
      </div>
    }
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(28px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .popup-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: 44px 40px 36px;
      max-width: 460px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45);
      text-align: center;
      animation: slideUp 0.38s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .popup-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--border-primary);
      border-radius: 50%;
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 2;
    }

    .popup-close:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .popup-close .material-icons { font-size: 15px; }

    .popup-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }

    .popup-orb--a {
      width: 320px;
      height: 320px;
      background: var(--accent-primary);
      top: -120px;
      right: -100px;
      opacity: 0.12;
    }

    .popup-orb--b {
      width: 220px;
      height: 220px;
      background: var(--accent-coral, #f97316);
      bottom: -70px;
      left: -70px;
      opacity: 0.09;
    }

    .popup-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--accent-primary-glow);
      border: 1px solid var(--accent-primary);
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-primary);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .popup-badge .material-icons { font-size: 14px; }

    .popup-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.75rem, 4vw, 2.2rem);
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.02em;
      margin-bottom: 14px;
      position: relative;
      z-index: 1;
    }

    .popup-highlight {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .popup-body {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    /* ── Timer ── */
    .popup-timer {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 8px;
      margin-bottom: 28px;
      position: relative;
      z-index: 1;
    }

    .timer-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .timer-digit {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      min-width: 68px;
      text-align: center;
      letter-spacing: 0.04em;
    }

    .timer-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--text-tertiary);
      text-transform: uppercase;
    }

    .timer-sep {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-primary);
      padding-top: 6px;
      line-height: 1;
    }

    /* ── Actions ── */
    .popup-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }

    .btn-popup-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 15px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .btn-popup-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-popup-primary .material-icons { font-size: 18px; }

    .btn-popup-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-primary);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s;
    }

    .btn-popup-secondary:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border-color: var(--border-secondary);
    }

    .popup-footnote {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
      position: relative;
      z-index: 1;
    }

    .popup-footnote strong {
      font-family: 'DM Mono', 'Courier New', monospace;
      color: var(--accent-primary);
      letter-spacing: 0.06em;
      background: var(--accent-primary-glow);
      padding: 2px 7px;
      border-radius: 4px;
    }

    @media (max-width: 480px) {
      .popup-card { padding: 36px 24px 28px; }
      .timer-digit { font-size: 1.7rem; min-width: 54px; padding: 8px 10px; }
    }
  `]
})
export class PromoPopupComponent implements OnInit, OnDestroy {
  visible = false;
  timerHours = 1;
  timerMinutes = 30;
  timerSeconds = 0;

  private countdownId: ReturnType<typeof setInterval> | null = null;
  private showTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private routerSub: Subscription | null = null;

  private readonly AUTH_ROUTES = ['/login', '/register'];

  constructor(
    private promo: PromoService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suppress on auth pages; watch for route changes too
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        if (this.AUTH_ROUTES.includes(e.urlAfterRedirects)) {
          this.hide();
        }
      });

    this.tryScheduleShow();
  }

  ngOnDestroy(): void {
    this.hide();
    this.routerSub?.unsubscribe();
  }

  private tryScheduleShow(): void {
    if (this.auth.isLoggedIn) return;
    if (this.promo.isDismissed()) return;
    if (this.promo.hasClaimedFirstPromo()) return;
    if (this.promo.isTimerExpired()) return;
    if (this.AUTH_ROUTES.includes(this.router.url)) return;

    this.promo.startTimer();

    this.showTimeoutId = setTimeout(() => {
      if (!this.auth.isLoggedIn && !this.promo.isDismissed()) {
        this.visible = true;
        this.startCountdown();
      }
    }, 5000);
  }

  private startCountdown(): void {
    this.tick();
    this.countdownId = setInterval(() => {
      this.tick();
      if (this.promo.getTimeRemainingMs() === 0) {
        this.hide();
      }
    }, 1000);
  }

  private tick(): void {
    const total = Math.floor(this.promo.getTimeRemainingMs() / 1000);
    this.timerHours = Math.floor(total / 3600);
    this.timerMinutes = Math.floor((total % 3600) / 60);
    this.timerSeconds = total % 60;
  }

  private hide(): void {
    this.visible = false;
    if (this.countdownId !== null) {
      clearInterval(this.countdownId);
      this.countdownId = null;
    }
    if (this.showTimeoutId !== null) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('popup-overlay')) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.promo.dismiss();
    this.hide();
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
