import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo-wrapper">
            <img src="src/assets/resources/img01.jpeg" alt="Nexus Sanguinis Logo" class="auth-logo" />
          </div>
          <h2>{{ 'AUTH.REGISTER_TITLE' | translate }}</h2>
          <p>{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>
        </div>

        @if (errorMessage) {
          <div class="error-banner">
            <svg class="alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.FULL_NAME' | translate }}</label>
            <input type="text" class="form-control" formControlName="full_name" placeholder="Dr. Jane Doe" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'AUTH.ROLE' | translate }}</label>
            <select class="form-select" formControlName="id_role">
              <option [ngValue]="1">{{ 'ROLES.ADMIN_GENERAL' | translate }}</option>
              <option [ngValue]="2">{{ 'ROLES.BANK_MANAGER' | translate }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" class="form-control" formControlName="email" placeholder="user@nexus.org" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary btn-submit" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? ('COMMON.LOADING' | translate) : ('AUTH.BTN_REGISTER' | translate) }}
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/login" class="btn-toggle">
            {{ 'AUTH.HAVE_ACCOUNT' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
    }
    .auth-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
      width: 100%;
      max-width: 440px;
      padding: 2.25rem;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
      h2 {
        color: #8B0000;
        font-size: 1.5rem;
        font-weight: 800;
        margin-top: 0.5rem;
      }
      p {
        color: #64748B;
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }
    }
    .auth-logo-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    .auth-logo {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(139, 0, 0, 0.25);
      border: 2px solid #8B0000;
    }
    .error-banner {
      background: #FEE2E2;
      color: #DC2626;
      border: 1px solid #FCA5A5;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-size: 0.825rem;
      margin-bottom: 1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .alert-icon {
      flex-shrink: 0;
    }
    .btn-submit {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.7rem;
    }
    .auth-footer {
      margin-top: 1.25rem;
      text-align: center;
    }
    .btn-toggle {
      background: transparent;
      border: none;
      color: #1E3A8A;
      font-weight: 600;
      font-size: 0.825rem;
      text-decoration: none;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }
  `],
})
export class RegisterComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      full_name: ['', [Validators.required]],
      id_role: [1, [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formVal = this.registerForm.value;

    this.authService
      .register({
        full_name: formVal.full_name,
        email: formVal.email,
        password: formVal.password,
        id_role: Number(formVal.id_role),
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Redirect to /login with success alert instead of going directly to /dashboard
          const successMsg = 'Cuenta creada exitosamente. Por favor inicia sesión.';

          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
            state: { successMessage: successMsg },
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed';
        },
      });
  }
}
