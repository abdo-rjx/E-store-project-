import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (errorMessage) {
            <div class="error-banner">{{ errorMessage }}</div>
          }
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="First name">
                @if (registerForm.get('firstName')?.hasError('required') && registerForm.get('firstName')?.touched) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Last name">
                @if (registerForm.get('lastName')?.hasError('required') && registerForm.get('lastName')?.touched) {
                  <mat-error>Last name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Create a password">
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="registerForm.invalid || loading" class="full-width">
              @if (loading) { Creating account... } @else { Register }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="full-width text-center">
            Already have an account? <a routerLink="/login">Login here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container { display: flex; justify-content: center; padding: 40px 16px; }
    mat-card { width: 100%; max-width: 500px; padding: 16px; }
    .full-width { width: 100%; }
    .half-width { width: 50%; padding-right: 8px; }
    .half-width:last-child { padding-right: 0; padding-left: 8px; }
    .row { display: flex; gap: 16px; }
    .text-center { text-align: center; margin-top: 16px; }
    .error-banner {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.api.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.auth.login(res.data);
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please check your details and try again.';
      }
    });
  }
}
