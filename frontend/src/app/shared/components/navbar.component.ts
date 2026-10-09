import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, TranslatePipe],
  template: `
    <header class="saas-header">
      <div class="header-left">
        @if (authService.isAuthenticated()) {
          <button
            type="button"
            class="btn-icon-toggle"
            (click)="layoutService.toggleSidebar()"
            [title]="layoutService.isSidebarCollapsed() ? ('NAV.EXPAND_SIDEBAR' | translate) : ('NAV.COLLAPSE_SIDEBAR' | translate)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        } @else {
          <a routerLink="/dashboard" class="brand-link-minimal">
            <img src="src/assets/resources/img01.jpeg" alt="Logo" class="brand-logo-small" />
            <span class="brand-title-small">{{ 'NAV.BRAND' | translate }}</span>
          </a>
        }
      </div>

      <!-- Center Minimal Search Bar -->
      @if (authService.isAuthenticated()) {
        <div class="header-search">
          <div class="search-input-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="search-input"
              [placeholder]="'NAV.SEARCH_PLACEHOLDER' | translate"
            />
            <kbd class="search-kbd">⌘K</kbd>
          </div>
        </div>
      }

      <!-- Right Actions: Network Indicator & User Profile Dropdown -->
      <div class="header-right">
        @if (authService.isAuthenticated()) {
          <!-- Network Status Indicator -->
          <div class="network-status" title="Real-time ACID Network Connection">
            <span class="pulse-dot"></span>
            <span class="network-label">{{ 'NAV.NETWORK_STATUS' | translate }}</span>
          </div>

          <!-- User Profile Dropdown -->
          <div class="user-dropdown-container">
            <button
              type="button"
              class="dropdown-trigger"
              (click)="toggleDropdown($event)"
              [attr.aria-expanded]="isDropdownOpen"
              title="User Settings & Profile"
            >
              <div class="user-avatar">
                {{ userInitials() }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ currentUser()?.full_name }}</span>
                <span class="user-meta">
                  {{ currentUser()?.role === 'ADMIN_GENERAL' ? ('ROLES.ADMIN_GENERAL' | translate) : ('ROLES.BANK_MANAGER' | translate) }}
                </span>
              </div>
              <svg
                class="dropdown-chevron"
                [class.chevron-open]="isDropdownOpen"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            @if (isDropdownOpen) {
              <div class="dropdown-menu">
                <!-- User Profile Header -->
                <div class="dropdown-header">
                  <div class="dropdown-header-avatar">
                    {{ userInitials() }}
                  </div>
                  <div class="dropdown-header-info">
                    <span class="dropdown-user-name">{{ currentUser()?.full_name }}</span>
                    <span class="dropdown-user-email">{{ currentUser()?.email }}</span>
                    <span class="dropdown-role-badge">
                      {{ currentUser()?.role === 'ADMIN_GENERAL' ? ('ROLES.ADMIN_GENERAL' | translate) : ('ROLES.BANK_MANAGER' | translate) }}
                    </span>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <!-- Language Switcher in Dropdown -->
                <div class="dropdown-section">
                  <div class="dropdown-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>{{ 'NAV.LANGUAGE' | translate }}</span>
                  </div>
                  <div class="dropdown-lang-wrapper">
                    <app-language-switcher></app-language-switcher>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <!-- Profile Settings Item -->
                <button type="button" class="dropdown-item dropdown-settings-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>{{ 'NAV.PROFILE_SETTINGS' | translate }}</span>
                </button>

                <div class="dropdown-divider"></div>

                <!-- Logout -->
                <button type="button" class="dropdown-item dropdown-logout-btn" (click)="onLogout()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>{{ 'NAV.LOGOUT' | translate }}</span>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="guest-actions">
            <app-language-switcher></app-language-switcher>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .saas-header {
      height: 64px;
      background: #fff;
      border-bottom: 1px solid #E2E8F0;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      position: sticky;
      top: 0;
      z-index: 80;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .btn-icon-toggle {
      background: transparent;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      cursor: pointer;
      &:hover { background: #F8FAFC; color: #0F172A; }
    }
    .brand-link-minimal { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
    .brand-logo-small { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #8B0000; }
    .brand-title-small { font-weight: 800; font-size: 1.05rem; color: #8B0000; }
    .header-search { flex: 1; max-width: 480px; }
    .search-input-wrap {
      display: flex;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0 0.75rem;
      &:focus-within {
        background: #fff;
        border-color: #1E3A8A;
      }
    }
    .search-icon { color: #94A3B8; margin-right: 0.5rem; }
    .search-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 0.45rem 0;
      font-size: 0.85rem;
      color: #0F172A;
      outline: none;
    }
    .search-kbd {
      font-size: 0.7rem;
      font-weight: 600;
      color: #94A3B8;
      background: #fff;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 0.1rem 0.35rem;
    }
    .header-right { display: flex; align-items: center; gap: 1.25rem; }
    .network-status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #166534;
    }
    .pulse-dot {
      width: 6.5px;
      height: 6.5px;
      border-radius: 50%;
      background: #22C55E;
    }
    .user-dropdown-container { position: relative; }
    .dropdown-trigger {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: transparent;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      color: #0F172A;
      &:hover { background: #F8FAFC; border-color: #E2E8F0; }
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #8B0000;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-details { display: flex; flex-direction: column; text-align: left; line-height: 1.15; }
    .user-name { font-size: 0.825rem; font-weight: 700; color: #0F172A; }
    .user-meta { font-size: 0.675rem; color: #64748B; font-weight: 500; }
    .dropdown-chevron {
      color: #94A3B8;
      transition: transform 0.2s;
      &.chevron-open { transform: rotate(180deg); }
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 240px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12);
      border: 1px solid #E2E8F0;
      padding: 0.5rem 0;
      z-index: 200;
    }
    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.4rem 0.9rem 0.6rem;
    }
    .dropdown-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #8B0000;
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dropdown-header-info { display: flex; flex-direction: column; overflow: hidden; }
    .dropdown-user-name { font-size: 0.85rem; font-weight: 700; color: #0F172A; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
    .dropdown-user-email { font-size: 0.725rem; color: #64748B; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
    .dropdown-role-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 9999px;
      background: #DBEAFE;
      color: #1E3A8A;
      text-transform: uppercase;
      margin-top: 0.2rem;
    }
    .dropdown-divider { height: 1px; background: #F1F5F9; margin: 0.35rem 0; }
    .dropdown-section {
      padding: 0.45rem 0.9rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .dropdown-section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .dropdown-lang-wrapper ::ng-deep .lang-switch-container {
      background: #F1F5F9;
      border-color: #CBD5E1;
      .lang-btn {
        color: #475569;
        &.active { background: #1E3A8A; color: #fff; }
      }
      .globe-icon { color: #64748B; }
      .divider { color: #94A3B8; }
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.55rem 0.9rem;
      font-size: 0.825rem;
      font-weight: 600;
      background: transparent;
      border: none;
      color: #475569;
      cursor: pointer;
      text-align: left;
      &:hover { background: #F8FAFC; color: #0F172A; }
    }
    .dropdown-logout-btn {
      color: #DC2626;
      &:hover { background: #FEE2E2; color: #B91C1C; }
    }
    .guest-actions { display: flex; align-items: center; }
  `],
})
export class NavbarComponent {
  isDropdownOpen = false;

  constructor(
    public authService: AuthService,
    public layoutService: LayoutService,
    private elementRef: ElementRef
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  userInitials(): string {
    const user = this.currentUser();
    if (!user || !user.full_name) return 'NS';
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.full_name.slice(0, 2).toUpperCase();
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onLogout() {
    this.isDropdownOpen = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
