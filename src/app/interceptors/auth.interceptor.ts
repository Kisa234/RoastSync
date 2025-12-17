// src/app/features/auth/service/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../features/auth/service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // ⛔ No adjuntar token a login ni refresh
  const isAuthCall =
    req.url.includes('/login') ||
    req.url.includes('/refresh');

  if (token && !auth.isTokenExpired(token) && !isAuthCall) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
