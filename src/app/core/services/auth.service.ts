import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthTokens, User } from '../models/analysis.model';
// Note: AuthTokens and User are re-exported from core/models/analysis.model

const ACCESS_KEY = 'tl_access';
const REFRESH_KEY = 'tl_refresh';
const USER_KEY = 'tl_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  // Reactive state
  private _currentUser = signal<User | null>(this._loadStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  register(data: {
    email: string;
    password: string;
    password_confirm: string;
    full_name?: string;
    country?: string;
  }): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/auth/register/`,
      data
    );
  }

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.apiUrl}/auth/login/`, { email, password })
      .pipe(
        tap(tokens => this._saveTokens(tokens)),
        catchError(err => throwError(() => err))
      );
  }

  logout(): Observable<{ message: string }> {
    const refresh = localStorage.getItem(REFRESH_KEY);
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/logout/`, { refresh })
      .pipe(
        tap(() => this._clearTokens()),
        catchError(err => {
          this._clearTokens();
          return throwError(() => err);
        })
      );
  }

  /** Called by JwtInterceptor when a refresh attempt fails — clears local state. */
  forceLogout(): void {
    this._clearTokens();
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem(REFRESH_KEY);
    return this.http
      .post<{ access: string }>(`${this.apiUrl}/auth/token/refresh/`, { refresh })
      .pipe(
        tap(({ access }) => localStorage.setItem(ACCESS_KEY, access))
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile/`).pipe(
      tap(user => {
        this._currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  private _saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
    this._currentUser.set(tokens.user);
  }

  private _clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }

  private _loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
