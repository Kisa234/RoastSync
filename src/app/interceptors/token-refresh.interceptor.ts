// src/app/features/auth/service/token-refresh.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      const isAuthCall = req.url.includes('/login') || req.url.includes('/refresh');
      const refreshToken = auth.getRefreshToken();
      if (err.status === 401 && !isAuthCall && refreshToken) {
        return auth.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = auth.getToken()!;
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(cloned);
          }),
          catchError(() => {
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }
      if (err.status === 401 && !isAuthCall) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
