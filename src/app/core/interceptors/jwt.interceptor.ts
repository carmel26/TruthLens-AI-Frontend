import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Public endpoints that never need a token and should never trigger a
 * refresh attempt when the server returns 401 (e.g. bad input, not auth).
 */
const PUBLIC_ENDPOINTS = [
  '/auth/register/',
  '/auth/login/',
  '/auth/token/refresh/',
  '/analysis/analyze/',
  '/analysis/url-info/',
  '/community/report/',
  '/community/campaigns/',
];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getAccessToken();
    const authReq = token ? this._addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // Never attempt a token refresh for public/auth endpoints, or when
          // no refresh token exists in storage.
          if (this._isPublicEndpoint(req.url) || !this.auth.getRefreshToken()) {
            return throwError(() => err);
          }
          return this._handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private _isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some(ep => url.includes(ep));
  }

  private _addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  private _handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t => next.handle(this._addToken(req, t!)))
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.auth.refreshAccessToken().pipe(
      switchMap(({ access }) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(access);
        return next.handle(this._addToken(req, access));
      }),
      catchError(refreshErr => {
        // Refresh itself failed — tokens are invalid; force logout
        this.isRefreshing = false;
        this.auth.forceLogout();
        return throwError(() => refreshErr);
      })
    );
  }
}
