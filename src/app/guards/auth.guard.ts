import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    const user = await firstValueFrom(auth.checkSession());

    // Cliente solo puede acceder a /client/*
    if (user.rol === 'cliente') {
      if (state.url.startsWith('/client')) {
        return true;
      }
      return router.parseUrl('/client/box-form');
    }

    // Admin -> rutas normales
    return true;

  } catch {
    return router.parseUrl('/login');
  }
};
