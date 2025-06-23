import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const TokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentPath = location.pathname;

  return next(req).pipe(
    catchError(err => {
      const hasRefreshToken = document.cookie.includes('refreshToken=');

      if (
        err.status === 401 &&
        !req.url.includes('/user/login') &&
        !req.url.includes('/user/refresh') &&
        hasRefreshToken &&
        currentPath !== '/login'
      ) {
        return auth.refreshAccessToken().pipe(
          switchMap(() => next(req)),
          catchError(error => {
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      if (err.status === 401 && currentPath !== '/login') {
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
