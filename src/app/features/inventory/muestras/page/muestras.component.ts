import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Eye, CheckCircle, Plus, ChevronDown } from 'lucide-angular';
import { AddMuestraComponent } from '../components/add-muestra/add-muestra.component';
import { ReportLoteComponent } from '../../../../shared/components/report-lote/report-lote.component';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { User } from '../../../../shared/models/user';
import { UserService } from '../../../users/service/users-service.service';
import { UiService } from '../../../../shared/services/ui.service';
import { MuestraService } from '../service/muestra.service';
import { MuestraConInventario } from '../../../../shared/models/muestra';
import { AddInventoryMuestraComponent } from "../components/add-inventory-muestra/add-inventory-muestra.component";

type FilterKey = 'todas' | 'sin-completar' | 'completadas';

@Component({
  selector: 'muestras-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AsyncPipe, NgIf, NgFor,
    LucideAngularModule, AddMuestraComponent, ReportLoteComponent,
    UserNamePipe, AddInventoryMuestraComponent
  ],
  templateUrl: './muestras.component.html'
})
export class MuestrasComponent {

  readonly Search = Search;
  readonly Eye = Eye;
  readonly CheckCircle = CheckCircle;
  readonly Plus = Plus;
  readonly ChevronDown = ChevronDown;

  muestras: MuestraConInventario[] = [];
  private _muestrasFiltradas: MuestraConInventario[] = [];

  public get muestrasFiltradas(): MuestraConInventario[] {
    return this._muestrasFiltradas;
  }
  public set muestrasFiltradas(value: MuestraConInventario[]) {
    this._muestrasFiltradas = value;
  }

  usuarios: User[] = [];

  filterTextMuestras = '';
  filterMuestra: FilterKey = 'todas';
  filtroTipo: 'admin' | 'cliente' = 'admin';
  incluirHistorico = false;

  filtersMuestras = [
    { key: 'todas', label: 'TODOS' },
    { key: 'sin-completar', label: 'SIN COMPLETAR' },
    { key: 'completadas', label: 'COMPLETADAS' }
  ];

  showAddMuestra = false;
  showReport = false;
  selectedMuestraId = '';
  selectedMuestra: MuestraConInventario | null = null;
  showAsignarInventarioModal = false;

  constructor(
    private muestraService: MuestraService,
    private userService: UserService,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.loadUsuarios();
    this.loadMuestras();
  }

  loadUsuarios() {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users ?? [];
      this.aplicarFiltro();
    });
  }

  loadMuestras() {
    this.muestraService.getMuestrasConInventario(this.incluirHistorico).subscribe(muestras => {
      this.muestras = muestras ?? [];
      this.aplicarFiltro();
    });
  }

  toggleHistorico() {
    this.incluirHistorico = !this.incluirHistorico;
    this.loadMuestras();
  }

  aplicarFiltro() {
    const term = this.filterTextMuestras.trim().toLowerCase();

    let filtradas = this.muestras.filter(m => {
      const user = this.usuarios.find(u => u.id_user === m.id_user);
      const cliente = (user?.nombre_comercial || user?.nombre || '').toLowerCase();

      const almacenes = (m.inventarioMuestras || [])
        .map(inv => inv.almacen?.nombre?.toLowerCase() || '')
        .join(' ');

      return (
        !term ||
        m.nombre_muestra?.toLowerCase().includes(term) ||
        m.productor?.toLowerCase().includes(term) ||
        m.finca?.toLowerCase().includes(term) ||
        m.distrito?.toLowerCase().includes(term) ||
        cliente.includes(term) ||
        almacenes.includes(term)
      );
    });

    switch (this.filterMuestra) {
      case 'completadas':
        filtradas = filtradas.filter(m => m.completado);
        break;
      case 'sin-completar':
        filtradas = filtradas.filter(m => !m.completado);
        break;
    }

    this.muestrasFiltradas = filtradas;
  }

  getMuestrasFiltradas(): MuestraConInventario[] {
    return this.muestrasFiltradas.filter(m =>
      this.filtroTipo === 'admin' ? m.owned_by_store : !m.owned_by_store
    );
  }

  aplicarFiltroTab(key: string) {
    this.filterMuestra = key as FilterKey;
    this.aplicarFiltro();
  }

  onSearchChange() {
    this.aplicarFiltro();
  }

  openAsignarInventarioMuestra(muestra: MuestraConInventario): void {
    this.selectedMuestra = muestra;
    this.showAsignarInventarioModal = true;
  }

  closeAsignarInventarioMuestra(): void {
    this.selectedMuestra = null;
    this.showAsignarInventarioModal = false;
  }

  onInventarioMuestraCreated(): void {
    this.closeAsignarInventarioMuestra();
    this.loadMuestras();
  }

  onComplete(m: MuestraConInventario) {
    this.muestraService.complete(m.id_muestra).subscribe(() => {
      this.uiService.alert('success', 'Éxito', 'Muestra marcada como completa');
      this.loadMuestras();
    });
  }

  onReport(m: MuestraConInventario) {
    this.muestraService.getById(m.id_muestra).subscribe(muestra => {
      if (!muestra?.id_analisis) {
        this.uiService.alert('error', 'Error', 'La muestra no tiene análisis asociado');
        return;
      }
      this.selectedMuestraId = m.id_muestra;
      this.showReport = true;
    });
  }

  onCreated() {
    this.showAddMuestra = false;
    this.loadMuestras();
  }

  getVariedadesArray(variedades: string | string[]): string[] {
    if (Array.isArray(variedades)) return variedades;
    if (!variedades) return [];
    return variedades.split(',').map(v => v.trim()).filter(Boolean);
  }
}