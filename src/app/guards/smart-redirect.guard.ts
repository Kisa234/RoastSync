import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../features/auth/service/auth.service';

export const smartRedirectGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (token) {
    // si hay token, directo al dashboard
    return router.parseUrl('/dashboard');
  }
  // si no, muestro el login
  return true;
};
