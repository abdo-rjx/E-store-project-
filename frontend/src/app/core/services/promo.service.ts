import { Injectable } from '@angular/core';

export interface ActivePromo {
  code: string;
  discount: number;
}

@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly TIMER_START_KEY = 'estore_promo_timer_start';
  private readonly DISMISSED_KEY = 'estore_popup_dismissed';
  private readonly ACTIVE_PROMO_KEY = 'estore_active_promo';
  private readonly FIRST_CLAIMED_KEY = 'estore_first_promo_claimed';

  readonly OFFER_DURATION_MS = 90 * 60 * 1000; // 1h 30min

  private readonly VALID_CODES: Record<string, number> = {
    WELCOME10: 10,
    FIRSTSAVE15: 15,
  };

  startTimer(): void {
    if (!localStorage.getItem(this.TIMER_START_KEY)) {
      localStorage.setItem(this.TIMER_START_KEY, Date.now().toString());
    }
  }

  getTimeRemainingMs(): number {
    const raw = localStorage.getItem(this.TIMER_START_KEY);
    if (!raw) return this.OFFER_DURATION_MS;
    const elapsed = Date.now() - parseInt(raw, 10);
    return Math.max(0, this.OFFER_DURATION_MS - elapsed);
  }

  isTimerExpired(): boolean {
    const raw = localStorage.getItem(this.TIMER_START_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) >= this.OFFER_DURATION_MS;
  }

  isDismissed(): boolean {
    return !!localStorage.getItem(this.DISMISSED_KEY);
  }

  dismiss(): void {
    localStorage.setItem(this.DISMISSED_KEY, 'true');
  }

  hasClaimedFirstPromo(): boolean {
    return !!localStorage.getItem(this.FIRST_CLAIMED_KEY);
  }

  // Returns the promo code string on the user's first sign-in, null afterwards.
  grantFirstSigninPromo(): string | null {
    if (this.hasClaimedFirstPromo()) return null;
    localStorage.setItem(this.FIRST_CLAIMED_KEY, 'true');
    return 'FIRSTSAVE15';
  }

  applyCode(code: string): { valid: boolean; discount: number; message: string } {
    const upper = code.toUpperCase().trim();
    const discount = this.VALID_CODES[upper];
    if (discount !== undefined) {
      const promo: ActivePromo = { code: upper, discount };
      localStorage.setItem(this.ACTIVE_PROMO_KEY, JSON.stringify(promo));
      return { valid: true, discount, message: `${discount}% discount applied!` };
    }
    return { valid: false, discount: 0, message: 'Invalid promo code.' };
  }

  getActivePromo(): ActivePromo | null {
    const stored = localStorage.getItem(this.ACTIVE_PROMO_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  removeActivePromo(): void {
    localStorage.removeItem(this.ACTIVE_PROMO_KEY);
  }
}
