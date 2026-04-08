import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/service/auth.service';

export const smartRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!token || auth.isTokenExpired(token)) {
    auth.logout();
    return true;
  }

  return router.parseUrl('/dashboard');
};