import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of, tap } from 'rxjs';
import { FALLBACK_EN, FALLBACK_ES } from '../i18n/fallback-translations';

export type SupportedLanguage = 'en' | 'es';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLangSignal = signal<SupportedLanguage>('en');
  public currentLang = this.currentLangSignal.asReadonly();
  public version = signal<number>(0);

  private translations: Record<SupportedLanguage, Record<string, any>> = {
    en: { ...FALLBACK_EN },
    es: { ...FALLBACK_ES },
  };

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('nexus_lang') as SupportedLanguage;
    const initial: SupportedLanguage = saved === 'es' || saved === 'en' ? saved : 'en';
    this.currentLangSignal.set(initial);

    // Initial load from assets
    this.loadTranslations('en');
    this.loadTranslations('es');
  }

  public async init(): Promise<void> {
    try {
      await Promise.allSettled([
        firstValueFrom(this.fetchLanguageFile('en')),
        firstValueFrom(this.fetchLanguageFile('es')),
      ]);
    } catch {
      // Fallbacks already in place
    }
  }

  private fetchLanguageFile(lang: SupportedLanguage) {
    const primaryUrl = `/assets/i18n/${lang}.json`;
    const fallbackUrl = `/i18n/${lang}.json`;

    return this.http.get<Record<string, any>>(primaryUrl).pipe(
      tap((data) => {
        if (data && typeof data === 'object') {
          this.translations[lang] = { ...this.translations[lang], ...data };
          this.version.update((v) => v + 1);
        }
      }),
      catchError(() => {
        return this.http.get<Record<string, any>>(fallbackUrl).pipe(
          tap((data) => {
            if (data && typeof data === 'object') {
              this.translations[lang] = { ...this.translations[lang], ...data };
              this.version.update((v) => v + 1);
            }
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  private loadTranslations(lang: SupportedLanguage) {
    this.fetchLanguageFile(lang).subscribe();
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLangSignal.set(lang);
    localStorage.setItem('nexus_lang', lang);
    this.version.update((v) => v + 1);
  }

  public translate(key: string): string {
    const lang = this.currentLangSignal();
    const currentDict = this.translations[lang] || {};
    const fallbackDict = this.translations['en'] || FALLBACK_EN;

    const val = this.extractValue(currentDict, key);
    if (val !== undefined) return val;

    const fallbackVal = this.extractValue(fallbackDict, key);
    if (fallbackVal !== undefined) return fallbackVal;

    return key;
  }

  private extractValue(dict: Record<string, any>, key: string): string | undefined {
    const keys = key.split('.');
    let current: any = dict;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }
}
