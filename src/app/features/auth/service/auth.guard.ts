import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  console.log('🔐 authGuard ejecutado');

  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    const res = await firstValueFrom(auth.checkSession());
    console.log('✅ sesión válida:', res);
    return true;
  } catch (err) {
    console.warn('⛔ sesión inválida:', err);
    router.navigate(['/login']);
    return false;
  }
};
