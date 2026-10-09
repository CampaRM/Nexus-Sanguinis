import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('nexus_token', 'mock_token');
    localStorage.setItem(
      'nexus_user',
      JSON.stringify({
        id_user: 1,
        full_name: 'Dr. Gregory House',
        email: 'house@nexus.org',
        role: 'ADMIN_GENERAL',
        id_medical_center: 1,
      })
    );

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AuthService,
        LayoutService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render minimalist search bar', () => {
    const searchInput = fixture.nativeElement.querySelector('.search-input');
    expect(searchInput).toBeTruthy();
  });

  it('should render network status indicator', () => {
    const networkStatus = fixture.nativeElement.querySelector('.network-status');
    const pulseDot = fixture.nativeElement.querySelector('.pulse-dot');
    expect(networkStatus).toBeTruthy();
    expect(pulseDot).toBeTruthy();
  });

  it('should render top-right User Profile dropdown containing Language Switcher, Profile Settings, and Logout', () => {
    const dropdownTrigger = fixture.nativeElement.querySelector('.dropdown-trigger');
    expect(dropdownTrigger).toBeTruthy();

    // Open dropdown
    dropdownTrigger.click();
    fixture.detectChanges();

    const dropdownMenu = fixture.nativeElement.querySelector('.dropdown-menu');
    expect(dropdownMenu).toBeTruthy();

    const langSwitcher = dropdownMenu.querySelector('app-language-switcher');
    expect(langSwitcher).toBeTruthy();

    const settingsItem = dropdownMenu.querySelector('.dropdown-settings-item');
    expect(settingsItem).toBeTruthy();

    const logoutBtn = dropdownMenu.querySelector('.dropdown-logout-btn');
    expect(logoutBtn).toBeTruthy();
  });
});
