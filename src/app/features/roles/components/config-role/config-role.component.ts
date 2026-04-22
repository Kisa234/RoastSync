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
import { UiService } from '../../../../shared/services/ui.service';
import { CreateRolComponent } from '../create-rol/create-rol.component';


@Component({
  selector: 'app-config-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CreateRolComponent
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

  // modales
  showCreateRoleModal = false;

  /* =======================
   * Save
   * ======================= */

  permisosOriginales: string[] = [];
  originalUserRoleId: string | null = null;

  saving = false;
  saveError = '';


  constructor(
    private userService: UserService,
    private rolService: RolService,
    private permisoService: PermisoService,
    private rolPermisoService: RolPermisoService,
    private ui: UiService
  ) { }

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
    this.userService.getUsersInternal().subscribe({
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
  MARCAR TODO 
  * ======================= */

  private getAllPermisoIds(): string[] {
    return this.permisos.map(p => p.id_permiso);
  }

  private getPermisoIdsByModulo(modulo: string): string[] {
    return (this.permisosPorModulo[modulo] ?? []).map(p => p.id_permiso);
  }

  isAllSelected(): boolean {
    const all = this.getAllPermisoIds();
    if (all.length === 0) return false;
    return all.every(id => this.permisosSeleccionados.includes(id));
  }

  isAllIndeterminate(): boolean {
    const all = this.getAllPermisoIds();
    if (all.length === 0) return false;
    const selectedCount = all.filter(id => this.permisosSeleccionados.includes(id)).length;
    return selectedCount > 0 && selectedCount < all.length;
  }

  isModuloSelected(modulo: string): boolean {
    const ids = this.getPermisoIdsByModulo(modulo);
    if (ids.length === 0) return false;
    return ids.every(id => this.permisosSeleccionados.includes(id));
  }

  isModuloIndeterminate(modulo: string): boolean {
    const ids = this.getPermisoIdsByModulo(modulo);
    if (ids.length === 0) return false;
    const selectedCount = ids.filter(id => this.permisosSeleccionados.includes(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  }

  toggleSelectAll(checked: boolean) {
    if (!this.selectedRoleId) return;

    const allIds = this.getAllPermisoIds();

    this.permisosSeleccionados = checked ? [...allIds] : [];
  }


  toggleSelectModulo(modulo: string, checked: boolean) {
    if (!this.selectedRoleId) return;

    const ids = this.getPermisoIdsByModulo(modulo);

    if (checked) {
      const set = new Set([...this.permisosSeleccionados, ...ids]);
      this.permisosSeleccionados = Array.from(set);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => !ids.includes(id));
    }
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
    this.permisosOriginales = [];
    this.originalUserRoleId = null;

    if (!userId) return;

    const user = this.users.find(u => u.id_user === userId);

    this.originalUserRoleId = user?.id_rol ?? null;

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
    this.rolPermisoService.getPermisosByRol(roleId).subscribe(permisos => {
      const ids = permisos.map(p => p.id_permiso);
      console.log(`Permisos del rol ${roleId}:`, permisos);

      this.permisosOriginales = [...ids];
      this.permisosSeleccionados = [...ids];
    });
  }


  togglePermiso(id_permiso: string, checked: boolean) {
    if (!this.selectedRoleId) return;

    if (checked) {
      if (!this.permisosSeleccionados.includes(id_permiso)) {
        this.permisosSeleccionados.push(id_permiso);
      }
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== id_permiso);
    }
  }


  /* =======================
   * Actions
   * ======================= */

  async save() {
    if (!this.selectedUserId || !this.selectedRoleId) return;

    this.saving = true;
    this.saveError = '';

    try {
      // 1) Si el rol cambió, pedir confirmación
      const rolCambio =
        (this.originalUserRoleId ?? null) !== (this.selectedRoleId ?? null);

      if (rolCambio) {
        const ok = await this.ui.confirm({
          title: 'Cambiar rol del usuario',
          message: 'Se detectó un cambio de rol. ¿Deseas actualizar el rol del usuario con el rol seleccionado?',
          confirmText: 'Sí, cambiar',
          cancelText: 'Cancelar'
        });

        if (!ok) {
          // opcional: revertir select al rol original
          this.selectedRoleId = this.originalUserRoleId;
          if (this.selectedRoleId) this.loadPermisosDelRol(this.selectedRoleId);
          this.saving = false;
          return;
        }

        // 2) Actualizar rol del usuario
        await new Promise<void>((resolve, reject) => {
          this.userService.assignRoleToUser(this.selectedUserId!, this.selectedRoleId!).subscribe({
            next: () => resolve(),
            error: (e: any) => reject(e)});
        });

        // si se cambió, actualiza el "original"
        this.originalUserRoleId = this.selectedRoleId;
      }

      // 3) Guardar permisos del rol (diff)
      const selectedSet = new Set(this.permisosSeleccionados);
      const originalSet = new Set(this.permisosOriginales);

      const toAdd = this.permisosSeleccionados.filter(id => !originalSet.has(id));
      const toRemove = this.permisosOriginales.filter(id => !selectedSet.has(id));

      // si no hay cambios de permisos y (si hubo) ya cambiamos rol -> cerrar
      if (toAdd.length === 0 && toRemove.length === 0) {
        this.permisosOriginales = [...this.permisosSeleccionados];
        this.saving = false;
        this.close.emit(true);
        return;
      }

      // Ejecutar requests
      const { forkJoin } = await import('rxjs');
      const requests: any[] = [];

      toAdd.forEach(id_permiso => {
        requests.push(this.rolPermisoService.assign({ id_rol: this.selectedRoleId!, id_permiso }));
      });

      toRemove.forEach(id_permiso => {
        requests.push(this.rolPermisoService.remove(this.selectedRoleId!, id_permiso));
      });

      await new Promise<void>((resolve, reject) => {
        forkJoin(requests).subscribe({
          next: () => resolve(),
          error: (e) => reject(e)
        });
      });

      // Actualiza snapshot y cierra
      this.permisosOriginales = [...this.permisosSeleccionados];
      this.saving = false;
      this.ui.alert('success', 'Guardado', 'Rol y permisos actualizados correctamente');
      this.close.emit(true);

    } catch (err: any) {
      this.saving = false;
      this.saveError = err?.error?.message || 'No se pudo guardar';
      this.ui.alert('error', 'Error', this.saveError);
    }
  }


  cancel() {
    this.close.emit(false);
  }

  /* =======================
   * MODAL
   * ======================= */

  openCreateRole() {
    this.showCreateRoleModal = true;
  }

  onCreateRoleClose(e: { created: boolean; rolId?: string }) {
    this.showCreateRoleModal = false;

    if (!e.created) return;

    // refrescar roles
    this.loadRoles();

    // opcional: auto-seleccionar el rol creado
    if (e.rolId) {
      this.selectedRoleId = e.rolId;
      this.permisosSeleccionados = [];
      this.loadPermisosDelRol(e.rolId);
    }
  }

}
