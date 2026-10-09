import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should redirect to /login with success alert message instead of /dashboard after successful registration', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const mockResponse: AuthResponse = {
      success: true,
      message: 'User registered',
      data: {
        user: { id_user: 1, full_name: 'Dr. Jane Doe', email: 'jane@nexus.org', role: 'ADMIN_GENERAL', id_medical_center: 1 },
        token: 'mock-jwt-token',
      },
    };
    vi.spyOn(authService, 'register').mockReturnValue(of(mockResponse));

    component.registerForm.setValue({
      full_name: 'Dr. Jane Doe',
      id_role: 1,
      email: 'jane@nexus.org',
      password: 'Password123!',
    });

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { registered: 'true' },
      state: { successMessage: 'Cuenta creada exitosamente. Por favor inicia sesión.' },
    });
    expect(navigateSpy).not.toHaveBeenCalledWith(['/dashboard']);
  });
});
