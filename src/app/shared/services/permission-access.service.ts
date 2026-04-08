import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Permiso } from '../../shared/models/permiso';
import { RolPermisoService } from '../../features/roles/service/rol-permiso-service.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionAccessService {
  private permisosSubject = new BehaviorSubject<Permiso[]>([]);
  permisos$ = this.permisosSubject.asObservable();

  constructor(
    private rolPermisoService: RolPermisoService
  ) {}

  loadPermissionsByRol(idRol: string): Observable<Permiso[]> {
    return this.rolPermisoService.getPermisosByRol(idRol).pipe(
      tap((permisos) => this.permisosSubject.next(permisos))
    );
  }

  setPermissions(permisos: Permiso[]): void {
    this.permisosSubject.next(permisos);
  }

  clearPermissions(): void {
    this.permisosSubject.next([]);
  }

  get permissions(): Permiso[] {
    return this.permisosSubject.value;
  }

  getPermissionsSnapshot(): Permiso[] {
    return this.permisosSubject.value;
  }

  hasPermission(codigo: string): boolean {
    return this.permisosSubject.value.some(p => p.codigo === codigo);
  }

  hasAnyPermission(codigos: string[]): boolean {
    return codigos.some(codigo => this.hasPermission(codigo));
  }

  hasAllPermissions(codigos: string[]): boolean {
    return codigos.every(codigo => this.hasPermission(codigo));
  }

  hasPermission$(codigo: string): Observable<boolean> {
    return this.permisos$.pipe(
      map(permisos => permisos.some(p => p.codigo === codigo))
    );
  }

  hasAnyPermission$(codigos: string[]): Observable<boolean> {
    return this.permisos$.pipe(
      map(permisos => codigos.some(codigo => permisos.some(p => p.codigo === codigo)))
    );
  }
}