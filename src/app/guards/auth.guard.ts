import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../features/auth/service/auth.service';
import { RolPermisoService } from '../features/roles/service/rol-permiso-service.service';
import { PermissionAccessService } from '../shared/services/permission-access.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rolPermisoService = inject(RolPermisoService);
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
      const permisos = await firstValueFrom(
        rolPermisoService.getPermisosByRol(user.id_rol)
      );

      permissionAccessService.setPermissions(permisos);
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