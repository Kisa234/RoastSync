import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { X, Check, LucideAngularModule } from 'lucide-angular';

import { Rol } from '../../../../shared/models/rol';
import { Permiso } from '../../../../shared/models/permiso';
import { User } from '../../../../shared/models/user';

import { RolService } from '../../service/rol-service.service';
import { PermisoService } from '../../service/permiso-service.service';
import { RolPermisoService } from '../../service/rol-permiso-service.service';
import { UserService } from '../../../users/service/users-service.service';

@Component({
  selector: 'app-config-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './config-role.component.html'
})
export class ConfigRoleComponent implements OnInit {

  /* =======================
   * Outputs
   * ======================= */
  @Output() close = new EventEmitter<boolean>();

  /* =======================
   * Icons
   * ======================= */
  X = X;
  Check = Check;

  /* =======================
   * Data sources
   * ======================= */
  users: User[] = [];
  roles: Rol[] = [];
  permisos: Permiso[] = [];

  /** Permisos agrupados por módulo (accordion) */
  permisosPorModulo: Record<string, Permiso[]> = {};

  /* =======================
   * Selected state
   * ======================= */
  selectedUserId: string | null = null;
  selectedRoleId: string | null = null;

  permisosSeleccionados: string[] = [];

  /* =======================
   * UI state
   * ======================= */
  loadingUsers = false;
  loadingRoles = false;
  loadingPermisos = false;

  /** Control de accordion */
  modulosAbiertos = new Set<string>();

  constructor(
    private userService: UserService,
    private rolService: RolService,
    private permisoService: PermisoService,
    private rolPermisoService: RolPermisoService
  ) {}

  /* =======================
   * Lifecycle
   * ======================= */
  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadPermisos();
  }

  /* =======================
   * Loaders
   * ======================= */
  loadUsers() {
    this.loadingUsers = true;
    this.userService.getUsersByRole('admin').subscribe({
      next: users => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: () => (this.loadingUsers = false)
    });
  }

  loadRoles() {
    this.loadingRoles = true;
    this.rolService.getAll().subscribe({
      next: roles => {
        this.roles = roles.filter(r => r.activo);
        this.loadingRoles = false;
      },
      error: () => (this.loadingRoles = false)
    });
  }

  loadPermisos() {
    this.loadingPermisos = true;
    this.permisoService.getAll().subscribe({
      next: permisos => {
        this.permisos = permisos;
        this.agruparPermisosPorModulo(permisos);

        // abre el primer módulo por defecto (opcional)
        const primerModulo = Object.keys(this.permisosPorModulo)[0];
        if (primerModulo) {
          this.modulosAbiertos.add(primerModulo);
        }

        this.loadingPermisos = false;
      },
      error: () => (this.loadingPermisos = false)
    });
  }

  /* =======================
   * Agrupación por módulo
   * ======================= */
  private agruparPermisosPorModulo(permisos: Permiso[]) {
    this.permisosPorModulo = permisos.reduce((acc, permiso) => {
      const modulo = permiso.modulo || 'OTROS';
      if (!acc[modulo]) acc[modulo] = [];
      acc[modulo].push(permiso);
      return acc;
    }, {} as Record<string, Permiso[]>);
  }

  /* =======================
   * Accordion helpers
   * ======================= */
  toggleModulo(modulo: string) {
    if (this.modulosAbiertos.has(modulo)) {
      this.modulosAbiertos.delete(modulo);
    } else {
      this.modulosAbiertos.add(modulo);
    }
  }

  isModuloAbierto(modulo: string): boolean {
    return this.modulosAbiertos.has(modulo);
  }

  abrirTodosLosModulos() {
    Object.keys(this.permisosPorModulo).forEach(m =>
      this.modulosAbiertos.add(m)
    );
  }

  cerrarTodosLosModulos() {
    this.modulosAbiertos.clear();
  }

  /* =======================
   * Events
   * ======================= */

  /** Cuando cambia el usuario */
  onUserChange(userId: string | null) {
    this.selectedUserId = userId;
    this.selectedRoleId = null;
    this.permisosSeleccionados = [];

    if (!userId) return;

    const user = this.users.find(u => u.id_user === userId);
    if (user?.id_rol) {
      this.selectedRoleId = user.id_rol;
      this.loadPermisosDelRol(user.id_rol);
    }
  }

  /** Cuando cambia el rol */
  onRoleChange(roleId: string | null) {
    if (!roleId) return;

    this.selectedRoleId = roleId;
    this.permisosSeleccionados = [];
    this.loadPermisosDelRol(roleId);
  }

  /* =======================
   * Permisos por rol
   * ======================= */
  loadPermisosDelRol(roleId: string) {
    this.rolPermisoService
      .getPermisosByRol(roleId)
      .subscribe(permisos => {
        this.permisosSeleccionados = permisos.map(p => p.id_permiso);
      });
  }

  togglePermiso(id_permiso: string, checked: boolean) {
    if (!this.selectedRoleId) return;

    if (checked) {
      this.rolPermisoService.assign({
        id_rol: this.selectedRoleId,
        id_permiso
      }).subscribe();
    } else {
      this.rolPermisoService.remove(
        this.selectedRoleId,
        id_permiso
      ).subscribe();
    }
  }

  /* =======================
   * Actions
   * ======================= */

  openCreateRole() {
    console.log('Abrir modal crear rol');
  }

  save() {
    if (!this.selectedUserId || !this.selectedRoleId) return;

    // aquí conectas updateRole cuando quieras
    // this.userService.updateRole(this.selectedUserId, this.selectedRoleId)
    //   .subscribe(() => this.close.emit(true));
  }

  cancel() {
    this.close.emit(false);
  }
}
