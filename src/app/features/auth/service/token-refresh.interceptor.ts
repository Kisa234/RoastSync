import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const TokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      // Si el token expiró y hay refreshToken, intenta renovarlo
      if (err.status === 401 && !req.url.includes('/user/login') && !req.url.includes('/user/refresh')) {
        return auth.refreshAccessToken().pipe(
          switchMap(() => {
            // Reintenta la request original después del refresh
            return next(req);
          }),
          catchError(error => {
            // Si también falla, redirige a login
            router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
