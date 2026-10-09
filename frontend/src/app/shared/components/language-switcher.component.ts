import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SupportedLanguage } from '../../core/services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switch-container">
      <svg class="globe-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <button
        type="button"
        class="lang-btn"
        [class.active]="currentLang() === 'en'"
        (click)="changeLanguage('en')"
        title="English"
      >
        EN
      </button>
      <span class="divider">/</span>
      <button
        type="button"
        class="lang-btn"
        [class.active]="currentLang() === 'es'"
        (click)="changeLanguage('es')"
        title="Español"
      >
        ES
      </button>
    </div>
  `,
  styles: [`
    .lang-switch-container {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .globe-icon {
      color: rgba(255, 255, 255, 0.85);
      flex-shrink: 0;
    }
    .lang-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.775rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.15s ease;
      letter-spacing: 0.03em;
      &:hover {
        color: #ffffff;
      }
      &.active {
        background: #ffffff;
        color: var(--primary, #8B0000);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
    }
    .divider {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }
  `],
})
export class LanguageSwitcherComponent {
  constructor(public i18nService: I18nService) {}

  get currentLang() {
    return this.i18nService.currentLang;
  }

  changeLanguage(lang: SupportedLanguage) {
    this.i18nService.setLanguage(lang);
  }
}
