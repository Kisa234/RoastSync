import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/service/auth.service';
import { catchError, map, of } from 'rxjs';

export const smartRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  // 🔑 SIN token o token vencido → dejar ver login SIN backend
  if (!token || auth.isTokenExpired(token)) {
    auth.logout(); // limpia refreshToken viejo
    return true;
  }

  // 🔑 SOLO aquí se llama al backend
  return auth.checkSession().pipe(
    map(user => {
      if (user.rol === 'cliente') {
        return router.parseUrl('/client/box-form');
      }
      return router.parseUrl('/dashboard');
    }),
    catchError(() => {
      auth.logout();
      return of(true);
    })
  );
};
