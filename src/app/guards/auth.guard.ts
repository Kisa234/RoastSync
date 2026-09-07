import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';
import { PermissionAccessService } from '../shared/services/permission-access.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permissionAccessService = inject(PermissionAccessService);

  const token = auth.getToken();

  if (!token || auth.isTokenExpired(token)) {
    auth.logout();
    permissionAccessService.clearPermissions();
    return router.parseUrl('/login');
  }

  try {
    const user = await firstValueFrom(auth.checkSession());

    if (user.id_rol) {
      await firstValueFrom(permissionAccessService.loadPermissionsByRol(user.id_rol));
    } else {
      permissionAccessService.clearPermissions();
    }

    return true;
  } catch {
    auth.logout();
    permissionAccessService.clearPermissions();
    return router.parseUrl('/login');
  }
};