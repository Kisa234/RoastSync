import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-angular';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { User } from '../../../../shared/models/user';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';
import { LoteTostadoConInventario } from '../../../../shared/models/lote-tostado';
import { PermissionAccessService } from '../../../../shared/services/permission-access.service';

type SortDir = 'asc' | 'desc' | null;
type ColKey = 'clasificacion' | 'precio_venta' | 'costo' | 'volumen';
type TipoCafe = 'verde' | 'tostado';

interface ColumnFilter {
  sortDir: SortDir;
  min: number | null;
  max: number | null;
  selectedValues: Set<string>;
}

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './kardex.component.html',
})
export class KardexComponent implements OnInit {

  readonly Search = Search;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly ChevronsUpDown = ChevronsUpDown;

  tipoCafe: TipoCafe = 'verde';

  lotes: LoteVerdeConInventario[] = [];
  lotesFiltrados: LoteVerdeConInventario[] = [];

  lotesTostados: LoteTostadoConInventario[] = [];
  lotesTostadosFiltrados: LoteTostadoConInventario[] = [];

  usuarios: User[] = [];
  filterText = '';

  openDropdown: ColKey | null = null;

  filters: Record<ColKey, ColumnFilter> = {
    clasificacion: { sortDir: null, min: null, max: null, selectedValues: new Set() },
    precio_venta: { sortDir: null, min: null, max: null, selectedValues: new Set() },
    costo: { sortDir: null, min: null, max: null, selectedValues: new Set() },
    volumen: { sortDir: null, min: null, max: null, selectedValues: new Set() },
  };

  clasificacionesDisponibles: string[] = ['básico', 'selecto', 'especial', 'exclusivo'];

  tempMin: Record<ColKey, string> = { clasificacion: '', precio_venta: '', costo: '', volumen: '' };
  tempMax: Record<ColKey, string> = { clasificacion: '', precio_venta: '', costo: '', volumen: '' };

  constructor(
    private loteSvc: LoteService,
    private userSvc: UserService,
    private loteTostadoSvc: LoteTostadoService,
    private permissionSvc: PermissionAccessService
  ) { }

  ngOnInit(): void {
    this.userSvc.getUsers().subscribe(users => {
      this.usuarios = users ?? [];
      this.aplicarFiltro();
    });

    this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
      this.lotes = lotes ?? [];
      this.aplicarFiltro();
    });

    this.loteTostadoSvc.getLotesTostadosConInventario().subscribe(lotes => {
      this.lotesTostados = lotes ?? [];
      this.aplicarFiltro();
    });
  }

  @HostListener('document:click')
  onClickOutside() {
    this.openDropdown = null;
  }

  toggleDropdown(col: ColKey, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === col ? null : col;
  }

  setTipo(tipo: TipoCafe) {
    this.tipoCafe = tipo;
    this.filterText = '';
    this.resetFilters();
    this.aplicarFiltro();
  }

  setSortDir(col: ColKey, dir: SortDir) {
    (Object.keys(this.filters) as ColKey[]).forEach(k => {
      if (k !== col) this.filters[k].sortDir = null;
    });
    this.filters[col].sortDir = this.filters[col].sortDir === dir ? null : dir;
    this.aplicarFiltro();
  }

  applyRangeFilter(col: ColKey) {
    this.filters[col].min = this.tempMin[col] !== '' ? Number(this.tempMin[col]) : null;
    this.filters[col].max = this.tempMax[col] !== '' ? Number(this.tempMax[col]) : null;
    this.aplicarFiltro();
  }

  clearRangeFilter(col: ColKey) {
    this.filters[col].min = null;
    this.filters[col].max = null;
    this.tempMin[col] = '';
    this.tempMax[col] = '';
    this.aplicarFiltro();
  }

  resetFilters() {
    (Object.keys(this.filters) as ColKey[]).forEach(k => {
      this.filters[k] = { sortDir: null, min: null, max: null, selectedValues: new Set() };
      this.tempMin[k] = '';
      this.tempMax[k] = '';
    });
  }

  toggleClasificacion(value: string) {
    const set = this.filters.clasificacion.selectedValues;
    set.has(value) ? set.delete(value) : set.add(value);
    this.aplicarFiltro();
  }

  clearClasificacion() {
    this.filters.clasificacion.selectedValues.clear();
    this.aplicarFiltro();
  }

  isClasificacionSelected(value: string): boolean {
    return this.filters.clasificacion.selectedValues.has(value);
  }

  hasActiveFilter(col: ColKey): boolean {
    const f = this.filters[col];
    return f.sortDir !== null || f.min !== null || f.max !== null || f.selectedValues.size > 0;
  }

  getVolumen(l: LoteVerdeConInventario): number {
    return (l.inventarioLotes || []).reduce(
      (total, inv) => total + Number(inv.cantidad_kg || 0), 0
    );
  }

  getVolumenTostado(l: LoteTostadoConInventario): number {
    return (l.inventarioLotesTostados || []).reduce(
      (total, inv) => total + Number(inv.cantidad_kg || 0), 0
    );
  }

  onSearchChange(): void {
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    const term = this.filterText.trim().toLowerCase();

    if (this.tipoCafe === 'verde') {
      let result = this.lotes.filter(l => {
        const user = this.usuarios.find(u => u.id_user === l.id_user);
        if (user?.rol !== 'admin') return false;

        const matchSearch = !term ||
          l.id_lote?.toLowerCase().includes(term) ||
          l.clasificacion?.toLowerCase().includes(term) ||
          l.productor?.toLowerCase().includes(term);

        if (!matchSearch) return false;

        const selClasif = this.filters.clasificacion.selectedValues;
        if (selClasif.size > 0) {
          const clasi = (l.clasificacion || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (!selClasif.has(clasi)) return false;
        }

        const fPV = this.filters.precio_venta;
        if (fPV.min !== null && (l.precio_venta ?? 0) < fPV.min) return false;
        if (fPV.max !== null && (l.precio_venta ?? 0) > fPV.max) return false;

        const fC = this.filters.costo;
        if (fC.min !== null && (l.costo ?? 0) < fC.min) return false;
        if (fC.max !== null && (l.costo ?? 0) > fC.max) return false;

        const fV = this.filters.volumen;
        const vol = this.getVolumen(l);
        if (fV.min !== null && vol < fV.min) return false;
        if (fV.max !== null && vol > fV.max) return false;

        return true;
      });

      const activeSort = (Object.keys(this.filters) as ColKey[]).find(k => this.filters[k].sortDir !== null);
      if (activeSort) {
        const dir = this.filters[activeSort].sortDir === 'asc' ? 1 : -1;
        result = result.sort((a, b) => {
          switch (activeSort) {
            case 'clasificacion':
              return (a.clasificacion || '').localeCompare(b.clasificacion || '') * dir;
            case 'precio_venta':
              return ((a.precio_venta ?? 0) - (b.precio_venta ?? 0)) * dir;
            case 'costo':
              return ((a.costo ?? 0) - (b.costo ?? 0)) * dir;
            case 'volumen':
              return (this.getVolumen(a) - this.getVolumen(b)) * dir;
          }
        });
      }

      this.lotesFiltrados = result;

    } else {
      let result = this.lotesTostados.filter(l => {
        const user = this.usuarios.find(u => u.id_user === l.id_user);
        if (user?.rol !== 'admin') return false;
        const matchSearch = !term ||
          l.id_lote_tostado?.toLowerCase().includes(term) ||
          l.lote?.clasificacion?.toLowerCase().includes(term) ||
          l.lote?.productor?.toLowerCase().includes(term) ||
          l.perfil_tostado?.toLowerCase().includes(term);

        if (!matchSearch) return false;

        const selClasif = this.filters.clasificacion.selectedValues;
        if (selClasif.size > 0) {
          const clasi = (l.lote?.clasificacion || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (!selClasif.has(clasi)) return false;
        }

        const fPV = this.filters.precio_venta;
        if (fPV.min !== null && (l.lote?.precio_venta ?? 0) < fPV.min) return false;
        if (fPV.max !== null && (l.lote?.precio_venta ?? 0) > fPV.max) return false;

        const fV = this.filters.volumen;
        const vol = this.getVolumenTostado(l);
        if (fV.min !== null && vol < fV.min) return false;
        if (fV.max !== null && vol > fV.max) return false;

        return true;
      });

      const activeSort = (Object.keys(this.filters) as ColKey[]).find(k => this.filters[k].sortDir !== null);
      if (activeSort) {
        const dir = this.filters[activeSort].sortDir === 'asc' ? 1 : -1;
        result = result.sort((a, b) => {
          switch (activeSort) {
            case 'clasificacion':
              return (a.lote?.clasificacion || '').localeCompare(b.lote?.clasificacion || '') * dir;
            case 'precio_venta':
              return ((a.lote?.precio_venta ?? 0) - (b.lote?.precio_venta ?? 0)) * dir;
            case 'volumen':
              return (this.getVolumenTostado(a) - this.getVolumenTostado(b)) * dir;
            default:
              return 0;
          }
        });
      }

      this.lotesTostadosFiltrados = result;
    }
  }

  get canVerPrecioCompra(): boolean {
    return this.permissionSvc.hasPermission('costeo.precios-compra.read');
  }
}