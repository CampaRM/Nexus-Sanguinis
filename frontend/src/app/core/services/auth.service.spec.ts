import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService (Frontend Test 1)', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }]),
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with unauthenticated state when no session exists', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.isAdmin()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should clear stored session on logout', () => {
    localStorage.setItem('nexus_token', 'mock_jwt_token');
    localStorage.setItem(
      'nexus_user',
      JSON.stringify({
        id_user: 1,
        full_name: 'Dr. Gregory House',
        email: 'admin@nexus.org',
        role: 'ADMIN_GENERAL',
        id_medical_center: 1,
      })
    );

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('nexus_token')).toBeNull();
  });
});
