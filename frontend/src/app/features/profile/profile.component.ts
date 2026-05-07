import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Profile } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1>My Profile</h1>

    <mat-card>
      <mat-card-header>
        <mat-card-title>Personal Information</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="Phone number">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address" placeholder="Street address">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="City">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country" placeholder="Country">
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" type="submit"
                  [disabled]="profileForm.invalid || loading">
            @if (loading) { Saving... } @else { Save Changes }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
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
