import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/service/auth.service';
import { catchError, map, of } from 'rxjs';

export const smartRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si no hay token → permitir ver login
  const token = auth.getToken();
  if (!token) return true;

  // Si hay token → verificar sesión en backend
  return auth.checkSession().pipe(
    map(user => {
      // Si el backend devuelve usuario válido:
      if (user.rol === 'cliente') {
        return router.parseUrl('/client/box-form');
      }

      // Admin u otros roles:
      return router.parseUrl('/dashboard');
    }),

    catchError(() => {
      // Si /me falla (token inválido / expirado)
      auth.logout();
      return of(true);  // permitir ver login
    })
  );
};
