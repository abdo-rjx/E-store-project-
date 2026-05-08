import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-stage container">
      <div class="profile-prologue">
        <h1>My Profile</h1>
        <p class="profile-subtitle">Manage your account information and preferences.</p>
      </div>

      <!-- Identity Card -->
      <div class="profile-card identity-card">
        <div class="identity-avatar">
          {{ authService.currentUser?.firstName?.charAt(0) }}{{ authService.currentUser?.lastName?.charAt(0) }}
        </div>
        <div class="identity-info">
          <h2>{{ authService.currentUser?.firstName }} {{ authService.currentUser?.lastName }}</h2>
          <span class="identity-email">{{ authService.currentUser?.email }}</span>
          <span class="identity-role" [class.role-admin]="authService.isAdmin">{{ authService.currentUser?.role }}</span>
        </div>
      </div>

      <!-- Form Card -->
      <div class="profile-card form-card">
        <div class="card-head">
          <h2 class="card-heading">Personal Information</h2>
          <p class="card-desc">Update your shipping and contact details.</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-flow">
          <div class="form-grid">
            <div class="es-input-group">
              <label for="phone">Phone Number</label>
              <input id="phone" type="tel" class="es-input" formControlName="phone"
                     placeholder="+1 (555) 000-0000">
            </div>
            <div class="es-input-group">
              <label for="country">Country</label>
              <input id="country" type="text" class="es-input" formControlName="country"
                     placeholder="United States">
            </div>
            <div class="es-input-group">
              <label for="city">City</label>
              <input id="city" type="text" class="es-input" formControlName="city"
                     placeholder="San Francisco">
            </div>
            <div class="es-input-group full-span">
              <label for="address">Street Address</label>
              <input id="address" type="text" class="es-input" formControlName="address"
                     placeholder="123 Innovation Drive">
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-save"
                    [disabled]="profileForm.invalid || loading">
              @if (loading) {
                <span class="btn-spinner"></span> Saving...
              } @else {
                <span class="material-icons">save</span>
                Save Changes
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-stage { padding: 24px 0; max-width: 800px; }

    .profile-prologue { margin-bottom: 36px; }

    .profile-prologue h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .profile-subtitle {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-secondary);
      font-size: 15px;
      margin-top: 6px;
    }

    .profile-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: 32px;
      margin-bottom: 24px;
    }

    /* Identity */
    .identity-card {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .identity-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      font-weight: 800;
      font-size: 24px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .identity-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .identity-info h2 {
      font-family: 'DM Sans', sans-serif;
      font-size: 20px;
      font-weight: 700;
    }

    .identity-email {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .identity-role {
      font-family: 'DM Sans', sans-serif;
      align-self: flex-start;
      margin-top: 6px;
      padding: 4px 14px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--accent-primary-glow);
      color: var(--accent-primary);
    }

    .identity-role.role-admin {
      background: var(--danger-bg);
      color: var(--danger);
    }

    /* Form */
    .card-head { margin-bottom: 28px; }

    .card-heading {
      font-family: 'DM Sans', sans-serif;
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .card-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .profile-flow {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .full-span { grid-column: 1 / -1; }

    .form-footer {
      display: flex;
      justify-content: flex-end;
    }

    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: var(--radius-pill);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 12px var(--accent-primary-glow);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--accent-primary-glow);
    }

    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-save .material-icons { font-size: 18px; }

    .btn-spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .identity-card { flex-direction: column; text-align: center; align-items: center; }
      .identity-role { align-self: center; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      phone: [''],
      address: [''],
      city: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (res) => {
        const p = res.data;
        this.profileForm.patchValue({
          phone: p.phone || '',
          address: p.address || '',
          city: p.city || '',
          country: p.country || ''
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.loading = true;
    this.api.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
