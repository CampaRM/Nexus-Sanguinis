import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { LayoutService } from '../../core/services/layout.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        LayoutService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
    fixture.detectChanges();
  });

  it('should render the brand logo using src/assets/resources/img01.jpeg', () => {
    const logoImg: HTMLImageElement | null = fixture.nativeElement.querySelector('.brand-logo');
    expect(logoImg).toBeTruthy();
    expect(logoImg?.getAttribute('src')).toBe('src/assets/resources/img01.jpeg');
  });

  it('should render all 5 required navigation links: Dashboard, Centers, Inventory, Transfers, Movements', () => {
    const navLinks: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.nav-link'));
    const hrefs = navLinks.map((link) => link.getAttribute('routerLink') || link.getAttribute('href'));

    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/centers');
    expect(hrefs).toContain('/inventory');
    expect(hrefs).toContain('/transfers');
    expect(hrefs).toContain('/movements');
  });

  it('should be collapsible via LayoutService toggle', () => {
    expect(layoutService.isSidebarCollapsed()).toBe(false);
    expect(fixture.nativeElement.querySelector('.saas-sidebar.collapsed')).toBeNull();

    layoutService.toggleSidebar();
    fixture.detectChanges();

    expect(layoutService.isSidebarCollapsed()).toBe(true);
    expect(fixture.nativeElement.querySelector('.saas-sidebar.collapsed')).toBeTruthy();
  });
});
