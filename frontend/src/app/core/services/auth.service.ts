import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/entities.model';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSignal = signal<User | null>(null);

  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.currentUserSignal());
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN_GENERAL');

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  private restoreSession() {
    const savedUser = localStorage.getItem('nexus_user');
    const token = localStorage.getItem('nexus_token');
    if (savedUser && token) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('nexus_token');
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('nexus_token', res.data.token);
          localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
          this.currentUserSignal.set(res.data.user);
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
