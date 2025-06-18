import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = auth.isAuthenticated();
  console.log('[authGuard] Autenticado:', isAuth);

  if (!isAuth) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
