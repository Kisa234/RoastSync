import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Edit2, Trash2, Plus, Eye } from 'lucide-angular';


import { Almacen } from '../../../../shared/models/almacen';
import { AlmacenService } from '../service/almacen.service';
import { UiService } from '../../../../shared/services/ui.service';
import { AddAlmacenComponent } from '../components/add-almacen/add-almacen.component';
import { EditAlmacenComponent } from '../components/edit-almacen/edit-almacen.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddAlmacenComponent,
    EditAlmacenComponent,
    RouterOutlet
  ],
  templateUrl: './almacen.component.html',
  styles: []
})
export class AlmacenComponent {

  // ICONOS
  readonly Search = Search;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Eye = Eye;

  // DATA
  almacenes: Almacen[] = [];
  private _almacenesFiltrados: Almacen[] = [];
  public get almacenesFiltrados(): Almacen[] {
    return this._almacenesFiltrados;
  }
  public set almacenesFiltrados(value: Almacen[]) {
    this._almacenesFiltrados = value;
  }

  // UI STATE
  filterText = '';
  totalAlmacenes = 0;
  totalActivos = 0;

  showAddAlmacen = false;
  showEditAlmacen = false;
  showMovimientos = false;

  selectedAlmacenId = '';
  isChildRoute = false;

  constructor(
    private almacenService: AlmacenService,
    private uiService: UiService,
    private router: Router
  ) { }


  ngOnInit() {
    this.loadAlmacenes();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.isChildRoute = this.router.url.includes('/inventory/almacen/movimientos/'));

    // inicial
    this.isChildRoute = this.router.url.includes('/inventory/almacen/movimientos/');
  }

  /* =========================
     DATA LOAD
     ========================= */

  loadAlmacenes() {
    this.almacenService.getAllAlmacenes().subscribe({
      next: (almacenes) => {
        this.almacenes = almacenes ?? [];
        this.aplicarFiltro();
      },
      error: () => {
        this.uiService.alert('error', 'Error', 'No se pudo cargar almacenes');
      }
    });
  }

  /* =========================
     FILTROS
     ========================= */

  aplicarFiltro() {
    const term = (this.filterText || '').toLowerCase().trim();

    const filtrados = this.almacenes.filter(a => {
      const nombre = (a.nombre || '').toLowerCase();
      const desc = (a.descripcion || '').toLowerCase();
      return !term || nombre.includes(term) || desc.includes(term) || a.id_almacen?.toLowerCase().includes(term);
    });

    this.almacenesFiltrados = filtrados;

    // KPIs
    this.totalAlmacenes = filtrados.length;
    this.totalActivos = filtrados.filter(a => a.activo !== false).length; // por defecto true si no viene
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  /* =========================
     HELPERS (ACTIVOS / INACTIVOS)
     ========================= */

  getActivos() {
    return this.almacenesFiltrados.filter(a => a.activo !== false);
  }

  getInactivos() {
    return this.almacenesFiltrados.filter(a => a.activo === false);
  }

  /* =========================
     ACCIONES
     ========================= */

  openEdit(a: Almacen) {
    this.selectedAlmacenId = a.id_almacen;
    this.showEditAlmacen = true;
  }

  delete(a: Almacen) {
    this.uiService.confirm({
      title: 'Eliminar almacén',
      message: `¿Estás seguro de eliminar el almacén "${a.nombre}"?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(ok => {
      if (!ok) return;

      this.almacenService.deleteAlmacen(a.id_almacen).subscribe({
        next: () => {
          this.uiService.alert('success', 'Éxito', 'Almacén eliminado');
          this.loadAlmacenes();
        },
        error: () => {
          this.uiService.alert('error', 'Error', 'No se pudo eliminar el almacén');
        }
      });
    });
  }

  /* =========================
     MODALES
     ========================= */

  onCreated() {
    this.showAddAlmacen = false;
    this.loadAlmacenes();
  }

  onUpdated() {
    this.showEditAlmacen = false;
    this.loadAlmacenes();
  }

  openMovimientos(a: any) {
    this.router.navigate(['/inventory/almacen/movimientos', a.id_almacen]);
  }
}
