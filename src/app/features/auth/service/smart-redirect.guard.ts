import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const smartRedirectGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    await firstValueFrom(auth.checkSession());
    router.navigate(['/dashboard']); // ✅ autenticado → dashboard
    return false;
  } catch {
    router.navigate(['/login']);     // ❌ no autenticado → login
    return false;
  }
};
