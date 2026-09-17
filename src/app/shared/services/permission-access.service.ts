import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { Permiso } from '../../shared/models/permiso';
import { RolPermisoService } from '../../features/roles/service/rol-permiso-service.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionAccessService {
  private permisosSubject = new BehaviorSubject<Permiso[]>([]);
  permisos$ = this.permisosSubject.asObservable();

  private isSuperAdmin = false;

  constructor(
    private rolPermisoService: RolPermisoService
  ) {}

  loadPermissionsByRol(idRol: string): Observable<Permiso[]> {
    this.isSuperAdmin = !!environment.superAdminRolId && idRol === environment.superAdminRolId;

    // Super admin: no depende de RolPermiso, no hace falta ni la llamada al backend
    if (this.isSuperAdmin) {
      this.permisosSubject.next([]);
      return of([]);
    }

    return this.rolPermisoService.getPermisosByRol(idRol).pipe(
      tap((permisos) => this.permisosSubject.next(permisos))
    );
  }

  setPermissions(permisos: Permiso[]): void {
    this.permisosSubject.next(permisos);
  }

  clearPermissions(): void {
    this.isSuperAdmin = false;
    this.permisosSubject.next([]);
  }

  get permissions(): Permiso[] {
    return this.permisosSubject.value;
  }

  getPermissionsSnapshot(): Permiso[] {
    return this.permisosSubject.value;
  }

  hasPermission(codigo: string): boolean {
    if (this.isSuperAdmin) return true;
    return this.permisosSubject.value.some(p => p.codigo === codigo);
  }

  hasAnyPermission(codigos: string[]): boolean {
    if (this.isSuperAdmin) return true;
    return codigos.some(codigo => this.hasPermission(codigo));
  }

  hasAllPermissions(codigos: string[]): boolean {
    if (this.isSuperAdmin) return true;
    return codigos.every(codigo => this.hasPermission(codigo));
  }

  hasPermission$(codigo: string): Observable<boolean> {
    if (this.isSuperAdmin) return of(true);
    return this.permisos$.pipe(
      map(permisos => permisos.some(p => p.codigo === codigo))
    );
  }

  hasAnyPermission$(codigos: string[]): Observable<boolean> {
    if (this.isSuperAdmin) return of(true);
    return this.permisos$.pipe(
      map(permisos => codigos.some(codigo => permisos.some(p => p.codigo === codigo)))
    );
  }
}