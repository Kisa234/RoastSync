import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionAccessService } from '../shared/services/permission-access.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permissionAccessService = inject(PermissionAccessService);
  const router = inject(Router);

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;
  const requireAll = route.data?.['requireAll'] as boolean | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requireAll
    ? permissionAccessService.hasAllPermissions(requiredPermissions)
    : permissionAccessService.hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return router.parseUrl('/unauthorized');
  }

  return true;
};