import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(key: string): string {
    // Read reactive signals so language toggle and dictionary loading trigger instant updates
    this.i18nService.currentLang();
    this.i18nService.version();
    return this.i18nService.translate(key);
  }
}

@NgModule({
  imports: [TranslatePipe],
  exports: [TranslatePipe],
})
export class TranslateModule {}
