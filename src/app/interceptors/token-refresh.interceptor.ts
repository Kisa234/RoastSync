// src/app/features/auth/service/token-refresh.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';

let isRefreshing = false;

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      const isAuthCall =
        req.url.includes('/login') ||
        req.url.includes('/refresh');

      const refreshToken = auth.getRefreshToken();

      // 👉 Intentar refresh SOLO UNA VEZ
      if (err.status === 401 && !isAuthCall && refreshToken && !isRefreshing) {
        isRefreshing = true;

        return auth.refreshAccessToken().pipe(
          switchMap(() => {
            isRefreshing = false;

            const newToken = auth.getToken();
            if (!newToken) {
              throw err;
            }

            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(cloned);
          }),
          catchError(() => {
            isRefreshing = false;
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }

      // 👉 401 sin refresh posible → logout
      if (err.status === 401 && !isAuthCall) {
        auth.logout();
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
