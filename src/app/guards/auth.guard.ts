import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';

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