import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    await firstValueFrom(auth.checkSession()); // ← consulta backend
    return true;
  } catch (err) {
    router.navigate(['/auth/login']);
    return false;
  }
};
