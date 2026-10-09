import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { I18nService } from '../../core/services/i18n.service';

describe('LanguageSwitcherComponent (Frontend Test 2)', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let i18nService: I18nService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [
        I18nService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    i18nService = TestBed.inject(I18nService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render language buttons and default to English', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.lang-btn');
    expect(buttons.length).toBe(2);
    expect(component.currentLang()).toBe('en');
  });

  it('should switch language to Spanish when clicking ES button', () => {
    component.changeLanguage('es');
    expect(component.currentLang()).toBe('es');
    expect(localStorage.getItem('nexus_lang')).toBe('es');
  });
});
