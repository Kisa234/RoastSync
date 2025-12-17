import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 🔑 1. NO hay token → login
  const token = auth.getToken();
  if (!token || auth.isTokenExpired(token)) {
    auth.logout();
    return router.parseUrl('/login');
  }

  try {
    // 🔑 2. Token válido → recién llamamos backend
    const user = await firstValueFrom(auth.checkSession());

    if (user.rol === 'cliente') {
      if (state.url.startsWith('/client')) {
        return true;
      }
      return router.parseUrl('/client/box-form');
    }

    return true;

  } catch {
    auth.logout();
    return router.parseUrl('/login');
  }
};
