import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PromoService } from '../../../core/services/promo.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-stage container">
      <div class="auth-ambience">
        <div class="ambience-orb ambience-orb--primary"></div>
        <div class="ambience-orb ambience-orb--secondary"></div>
      </div>

      <div class="auth-inner">
        <div class="auth-prologue">
          <a routerLink="/" class="prologue-brand">
            <span class="prologue-icon">E</span>
            <span class="prologue-text">Estoré</span>
          </a>
          <p class="prologue-subtitle">Welcome back. Your premium experience awaits.</p>
        </div>

        <div class="auth-frame">
          <div class="auth-tabs">
            <a routerLink="/login" class="auth-tab is-active">Sign In</a>
            <a routerLink="/register" class="auth-tab">Create Account</a>
          </div>

          @if (errorMessage) {
            <div class="auth-alert">
              <span class="material-icons">error_outline</span>
              {{ errorMessage }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-flow">
            <div class="es-input-group">
              <label for="email">Email Address</label>
              <input id="email" type="email" class="es-input" formControlName="email"
                     placeholder="you@example.com">
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <span class="es-error">Email is required</span>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <span class="es-error">Enter a valid email address</span>
              }
            </div>

            <div class="es-input-group">
              <label for="password">Password</label>
              <div class="password-field">
                <input id="password" [type]="showPassword ? 'text' : 'password'"
                       class="es-input" formControlName="password"
                       placeholder="Enter your password">
                <button type="button" class="password-peek" (click)="showPassword = !showPassword">
                  <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <span class="es-error">Password is required</span>
              }
            </div>

            <button type="submit" class="btn-access"
                    [disabled]="loginForm.invalid || loading">
              @if (loading) {
                <span class="btn-spinner"></span> Signing in...
              } @else {
                Access System
                <span class="material-icons">arrow_forward</span>
              }
            </button>
          </form>
        </div>

        <div class="auth-legal">
          <span>Terms of Service</span>
          <span class="legal-sep">·</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-stage {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 60px 24px;
    }

    .auth-ambience {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .ambience-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(160px);
    }

    .ambience-orb--primary {
      width: 600px;
      height: 600px;
      background: var(--accent-primary);
      top: -200px;
      right: -150px;
      opacity: 0.07;
    }

    .ambience-orb--secondary {
      width: 400px;
      height: 400px;
      background: var(--accent-coral);
      bottom: -100px;
      left: -100px;
      opacity: 0.05;
    }

    .auth-inner {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .auth-prologue {
      text-align: center;
      margin-bottom: 40px;
    }

    .prologue-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      margin-bottom: 14px;
    }

    .prologue-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      border-radius: 10px;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 18px;
      color: #fff;
    }

    .prologue-text {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: 0.02em;
    }

    .prologue-subtitle {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-tertiary);
    }

    .auth-frame {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: 32px;
      box-shadow: var(--shadow-float);
    }

    .auth-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-primary);
      margin-bottom: 28px;
    }

    .auth-tab {
      flex: 1;
      padding: 14px;
      text-align: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: all 0.25s ease;
    }

    .auth-tab.is-active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }

    .auth-tab:hover { color: var(--text-primary); }

    .auth-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: var(--danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-md);
      color: var(--danger);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      margin-bottom: 24px;
    }

    .auth-alert .material-icons { font-size: 18px; }

    .auth-flow {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .password-field {
      position: relative;
    }

    .password-peek {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }

    .password-peek:hover { color: var(--text-primary); }
    .password-peek .material-icons { font-size: 20px; }

    .btn-access {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 32px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      margin-top: 4px;
    }

    .btn-access:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--accent-primary-glow);
    }

    .btn-access:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-access .material-icons { font-size: 18px; }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-legal {
      display: flex;
      gap: 8px;
      margin-top: 28px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .legal-sep { color: var(--text-tertiary); }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private promo: PromoService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.api.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.auth.login(res.data);
        const code = this.promo.grantFirstSigninPromo();
        if (code) {
          this.snackBar.open(
            `Welcome! Your promo code: ${code} — 15% off your first order`,
            'Got it',
            { duration: 8000, panelClass: 'promo-snack' }
          );
        } else {
          this.snackBar.open('Welcome back!', 'Close', { duration: 3000 });
        }
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Invalid email or password';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your connection.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }
}
