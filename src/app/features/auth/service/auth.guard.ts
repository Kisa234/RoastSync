import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  try {
    await firstValueFrom(auth.checkSession());
    return true;
  } catch {
    return router.parseUrl('/login');
  }
};