import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar.component';
import { SidebarComponent } from './shared/components/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <div class="saas-app-container">
        <app-sidebar></app-sidebar>
        <div class="saas-main-viewport">
          <app-navbar></app-navbar>
          <main class="saas-content-area">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    } @else {
      <div class="saas-auth-container">
        <router-outlet></router-outlet>
      </div>
    }
  `,
  styles: [`
    .saas-app-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main, #F8FAFC);
    }
    .saas-main-viewport {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }
    .saas-content-area {
      flex: 1;
      background-color: var(--bg-main, #F8FAFC);
    }
    .saas-auth-container {
      min-height: 100vh;
      background-color: var(--bg-main, #F8FAFC);
    }
  `],
})
export class App {
  constructor(public authService: AuthService) {}
}
