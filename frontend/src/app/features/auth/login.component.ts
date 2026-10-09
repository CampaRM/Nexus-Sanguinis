import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo-wrapper">
            <img src="src/assets/resources/img01.jpeg" alt="Nexus Sanguinis Logo" class="auth-logo" />
          </div>
          <h2>{{ isRegisterMode ? ('AUTH.REGISTER_TITLE' | translate) : ('AUTH.LOGIN_TITLE' | translate) }}</h2>
          <p>{{ isRegisterMode ? ('AUTH.REGISTER_SUBTITLE' | translate) : ('AUTH.LOGIN_SUBTITLE' | translate) }}</p>
        </div>

        @if (successMessage) {
          <div class="alert alert-success success-banner" role="alert">
            <svg class="alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span class="alert-message">{{ successMessage }}</span>
          </div>
        }

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

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          @if (isRegisterMode) {
            <div class="form-group">
              <label class="form-label">{{ 'AUTH.FULL_NAME' | translate }}</label>
              <input type="text" class="form-control" formControlName="full_name" placeholder="Dr. John Doe" />
            </div>

            <div class="form-group">
              <label class="form-label">{{ 'AUTH.ROLE' | translate }}</label>
              <select class="form-select" formControlName="id_role">
                <option [ngValue]="1">{{ 'ROLES.ADMIN_GENERAL' | translate }}</option>
                <option [ngValue]="2">{{ 'ROLES.BANK_MANAGER' | translate }}</option>
              </select>
            </div>
          }

          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" class="form-control" formControlName="email" placeholder="user@nexus.org" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary btn-submit" [disabled]="authForm.invalid || isLoading">
            {{ isLoading ? ('COMMON.LOADING' | translate) : (isRegisterMode ? ('AUTH.BTN_REGISTER' | translate) : ('AUTH.BTN_LOGIN' | translate)) }}
          </button>
        </form>

        <div class="quick-credentials">
          <span class="quick-title">Quick Demo Logins</span>
          <div class="quick-buttons">
            <button type="button" class="btn btn-sm btn-outline" (click)="fillAdmin()">Admin Login</button>
            <button type="button" class="btn btn-sm btn-outline" (click)="fillManager()">Manager Login</button>
          </div>
        </div>

        <div class="auth-footer">
          <button type="button" class="btn-toggle" (click)="toggleMode()">
            {{ isRegisterMode ? ('AUTH.HAVE_ACCOUNT' | translate) : ('AUTH.NO_ACCOUNT' | translate) }}
          </button>
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
    .success-banner {
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #86EFAC;
      padding: 0.75rem 0.9rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    .quick-credentials {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px dashed #E2E8F0;
      text-align: center;
    }
    .quick-title {
      display: block;
      font-size: 0.75rem;
      color: #64748B;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .quick-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
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
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }
  `],
})
export class LoginComponent implements OnInit {
  isRegisterMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  authForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.authForm = this.fb.group({
      email: ['admin@nexus.org', [Validators.required, Validators.email]],
      password: ['Admin123!', [Validators.required, Validators.minLength(6)]],
      full_name: [''],
      id_role: [1],
    });
  }

  ngOnInit(): void {
    if (this.router.url.includes('register')) {
      this.isRegisterMode = true;
      this.authForm.get('full_name')?.setValidators([Validators.required]);
      this.authForm.get('full_name')?.updateValueAndValidity();
    }

    const state = history.state;
    if (state && state.successMessage) {
      this.successMessage = state.successMessage;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['registered']) {
        this.successMessage =
          history.state?.successMessage ||
          'Cuenta creada exitosamente. Por favor inicia sesión.';
      }
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.isRegisterMode) {
      this.authForm.get('full_name')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('full_name')?.clearValidators();
    }
    this.authForm.get('full_name')?.updateValueAndValidity();
  }

  fillAdmin() {
    this.isRegisterMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.authForm.patchValue({
      email: 'admin@nexus.org',
      password: 'Admin123!',
    });
  }

  fillManager() {
    this.isRegisterMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.authForm.patchValue({
      email: 'manager.metro@nexus.org',
      password: 'Manager123!',
    });
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formVal = this.authForm.value;

    if (this.isRegisterMode) {
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
            this.isRegisterMode = false;
            this.errorMessage = '';
            this.successMessage = this.i18nService.translate('AUTH.REGISTER_SUCCESS');
            this.authForm.reset({
              email: formVal.email,
              password: '',
              full_name: '',
              id_role: 1,
            });
            this.authForm.get('full_name')?.clearValidators();
            this.authForm.get('full_name')?.updateValueAndValidity();
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Registration failed';
          },
        });
    } else {
      this.authService
        .login({
          email: formVal.email,
          password: formVal.password,
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Login failed';
          },
        });
    }
  }
}
