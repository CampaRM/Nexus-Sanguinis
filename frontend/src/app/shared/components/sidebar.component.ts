import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <aside class="saas-sidebar" [class.collapsed]="layoutService.isSidebarCollapsed()">
      <!-- Top Branding Section -->
      <div class="sidebar-brand">
        <a routerLink="/dashboard" class="brand-link" [title]="'NAV.BRAND' | translate">
          <div class="brand-logo-wrap">
            <img src="src/assets/resources/img01.jpeg" alt="Nexus Sanguinis Logo" class="brand-logo" />
          </div>
          @if (!layoutService.isSidebarCollapsed()) {
            <div class="brand-info">
              <span class="brand-title">{{ 'NAV.BRAND' | translate }}</span>
              <span class="brand-badge">CLINICAL NETWORK</span>
            </div>
          }
        </a>
      </div>

      <!-- Main Navigation Routes -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!layoutService.isSidebarCollapsed()">
          <span>PLATFORM MENU</span>
        </div>

        <ul class="nav-list">
          <!-- 1. Dashboard -->
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" [title]="'NAV.DASHBOARD' | translate">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
              </svg>
              @if (!layoutService.isSidebarCollapsed()) {
                <span class="nav-label">{{ 'NAV.DASHBOARD' | translate }}</span>
              }
            </a>
          </li>

          <!-- 2. Medical Centers -->
          <li class="nav-item">
            <a routerLink="/centers" routerLinkActive="active" class="nav-link" [title]="'NAV.CENTERS' | translate">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
              @if (!layoutService.isSidebarCollapsed()) {
                <span class="nav-label">{{ 'NAV.CENTERS' | translate }}</span>
              }
            </a>
          </li>

          <!-- 3. Blood Inventory -->
          <li class="nav-item">
            <a routerLink="/inventory" routerLinkActive="active" class="nav-link" [title]="'NAV.INVENTORY' | translate">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              @if (!layoutService.isSidebarCollapsed()) {
                <span class="nav-label">{{ 'NAV.INVENTORY' | translate }}</span>
              }
            </a>
          </li>

          <!-- 4. Transfer Requests -->
          <li class="nav-item">
            <a routerLink="/transfers" routerLinkActive="active" class="nav-link" [title]="'NAV.TRANSFERS' | translate">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3 4 7l4 4"></path>
                <path d="M4 7h16"></path>
                <path d="m16 21 4-4-4-4"></path>
                <path d="M20 17H4"></path>
              </svg>
              @if (!layoutService.isSidebarCollapsed()) {
                <span class="nav-label">{{ 'NAV.TRANSFERS' | translate }}</span>
              }
            </a>
          </li>

          <!-- 5. Audit History -->
          <li class="nav-item">
            <a routerLink="/movements" routerLinkActive="active" class="nav-link" [title]="'NAV.MOVEMENTS' | translate">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
                <path d="M3.05 11a9 9 0 0 1 .5-2"></path>
              </svg>
              @if (!layoutService.isSidebarCollapsed()) {
                <span class="nav-label">{{ 'NAV.MOVEMENTS' | translate }}</span>
              }
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer / Facility Info -->
      <div class="sidebar-footer">
        @if (!layoutService.isSidebarCollapsed()) {
          <div class="facility-card">
            <div class="facility-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="facility-info">
              <span class="facility-title">{{ currentUser()?.medical_center_name || 'Central Operations' }}</span>
              <span class="facility-sub">ACID Guaranteed</span>
            </div>
          </div>
        }
        <button
          type="button"
          class="btn-toggle-sidebar"
          (click)="layoutService.toggleSidebar()"
          [title]="layoutService.isSidebarCollapsed() ? ('NAV.EXPAND_SIDEBAR' | translate) : ('NAV.COLLAPSE_SIDEBAR' | translate)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="layoutService.isSidebarCollapsed()">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .saas-sidebar {
      width: 250px;
      min-width: 250px;
      height: 100vh;
      background: #FFFFFF;
      border-right: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      z-index: 90;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 1px 0 3px rgba(0, 0, 0, 0.02);
      &.collapsed {
        width: 72px;
        min-width: 72px;
        .sidebar-brand { justify-content: center; padding: 1.25rem 0.5rem; }
        .nav-link { justify-content: center; padding: 0.75rem 0; }
        .sidebar-footer { justify-content: center; padding: 1rem 0.5rem; }
      }
    }
    .sidebar-brand {
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo-wrap {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(139, 0, 0, 0.2);
      border: 1.5px solid #8B0000;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
    }
    .brand-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .brand-info {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-title {
      font-size: 1rem;
      font-weight: 800;
      color: #8B0000;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      font-size: 0.625rem;
      font-weight: 700;
      color: #1E3A8A;
      letter-spacing: 0.06em;
      margin-top: 2px;
    }
    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      overflow-y: auto;
    }
    .nav-section-title {
      font-size: 0.675rem;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.08em;
      padding: 0 0.65rem 0.5rem;
    }
    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-item { width: 100%; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.15s ease;
      position: relative;
      &:hover {
        background: #F8FAFC;
        color: #0F172A;
        .nav-icon { color: #1E3A8A; }
      }
      &.active {
        background: #FEE2E2;
        color: #8B0000;
        font-weight: 700;
        .nav-icon { color: #8B0000; }
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 15%;
          height: 70%;
          width: 3.5px;
          border-radius: 0 4px 4px 0;
          background: #8B0000;
        }
      }
    }
    .nav-icon {
      color: #64748B;
      flex-shrink: 0;
      transition: color 0.15s ease;
    }
    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-footer {
      padding: 0.85rem 0.75rem;
      border-top: 1px solid #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .facility-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow: hidden;
    }
    .facility-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #EFF6FF;
      color: #1E3A8A;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .facility-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      line-height: 1.15;
    }
    .facility-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #1E293B;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .facility-sub {
      font-size: 0.65rem;
      color: #16A34A;
      font-weight: 600;
    }
    .btn-toggle-sidebar {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      color: #64748B;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      &:hover {
        background: #E2E8F0;
        color: #0F172A;
      }
      svg.rotated {
        transform: rotate(180deg);
      }
    }
  `],
})
export class SidebarComponent {
  constructor(
    public authService: AuthService,
    public layoutService: LayoutService
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }
}
