import { CommonModule, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Search, Pencil, RefreshCcw } from 'lucide-angular';

import { ProductoService } from '../../../products/service/producto.service';
import { InsumoService } from '../../../insumo/service/insumo.service';
import { LoteService } from '../../../lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../../../lotes-tostados/service/lote-tostado.service';
import { MuestraService } from '../../../muestras/service/muestra.service';
import { BolsaService } from '../../../bolsa/service/bolsa.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';

import { ProductoConInventarios } from '../../../../../shared/models/producto';
import { InsumoConInventarios } from '../../../../../shared/models/insumo';
import { LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { LoteTostadoConInventario } from '../../../../../shared/models/lote-tostado';
import { MuestraConInventario } from '../../../../../shared/models/muestra';
import { BolsaConInventario } from '../../../../../shared/models/bolsa';
import { User as UserEntity } from '../../../../../shared/models/user';

import { CategoriaNombrePipe } from '../../../../../shared/pipes/categoria-nombre.pipe';
import { CategoriaInsumoPipe } from '../../../../../shared/pipes/categoria-insumo.pipe';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { SelectSearchComponent } from '../../../../../shared/components/select-search/select-search.component';
import {
  InventorySearchRow,
  InventoryByAlmacen,
  InventoryUiTipo,
  labelTipo,
} from '../../../../../shared/models/inventory-search-row';

type TabTipo = 'TODOS' | InventoryUiTipo;

interface UpdateInventoryResponse {
  productos: ProductoConInventarios[] | null;
  insumos: InsumoConInventarios[] | null;
  lotesVerdes: LoteVerdeConInventario[] | null;
  lotesTostados: LoteTostadoConInventario[] | null;
  muestras: MuestraConInventario[] | null;
  bolsas: BolsaConInventario[] | null;
}

@Component({
  selector: 'app-update-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault,
    LucideAngularModule, CategoriaNombrePipe, CategoriaInsumoPipe, UserNamePipe, SelectSearchComponent,
  ],
  templateUrl: './update-inventory.component.html',
})
export class UpdateInventoryComponent implements OnInit {
  readonly Search = Search;
  readonly Pencil = Pencil;
  readonly RefreshCcw = RefreshCcw;
  readonly labelTipo = labelTipo;

  // sentinel de UI — no es un id_user real, solo marca "filtrar por lotes de tienda"
  readonly STORE_SENTINEL = '__STORE__';

  loading = signal(true);
  error = signal('');

  clientes: UserEntity[] = [];
  clientesConTienda: (UserEntity | { id_user: string; nombre: string })[] = [];

  search = signal('');
  searchUser = signal('');
  activeTab = signal<TabTipo>('TODOS');
  onlyWithStock = signal(true);

  rows = signal<InventorySearchRow[]>([]);

  readonly tabs: { key: TabTipo; label: string }[] = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'PRODUCTO', label: 'Productos' },
    { key: 'INSUMO', label: 'Insumos' },
    { key: 'MUESTRA', label: 'Muestras' },
    { key: 'LOTE_VERDE', label: 'Lotes Verdes' },
    { key: 'LOTE_TOSTADO', label: 'Lotes Tostados' },
    { key: 'BOLSA', label: 'Bolsas' },
  ];

  /** Filtra por todo salvo el tipo — se usa para calcular el contador de cada tab
   *  sin que el tab activo se afecte a sí mismo. */
  private readonly baseFiltered = computed(() => {
    const general = this.search().trim().toLowerCase();
    const user = this.searchUser().trim();
    const withStock = this.onlyWithStock();

    return this.rows().filter(row => {
      if (general && !(
        row.id.toLowerCase().includes(general) ||
        row.displayName.toLowerCase().includes(general) ||
        row.reference.toLowerCase().includes(general)
      )) return false;

      if (user === this.STORE_SENTINEL) {
        if (!row.ownedByStore) return false;
      } else if (user && !(row.userId ?? '').toLowerCase().includes(user.toLowerCase())) {
        return false;
      }

      if (withStock && row.stockTotal <= 0) return false;

      return true;
    });
  });

  readonly filteredRows = computed(() => {
    const tab = this.activeTab();
    const base = this.baseFiltered();
    const data = tab === 'TODOS' ? base : base.filter(r => r.tipo === tab);
    return [...data].sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  countForTab(tab: TabTipo): number {
    const base = this.baseFiltered();
    return tab === 'TODOS' ? base.length : base.filter(r => r.tipo === tab).length;
  }

  constructor(
    private productoService: ProductoService,
    private insumoService: InsumoService,
    private loteService: LoteService,
    private loteTostadoService: LoteTostadoService,
    private muestraService: MuestraService,
    private bolsaService: BolsaService,
    private userService: UserService,
    private uiService: UiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUsers().subscribe(users => {
      this.clientes = users;
      this.clientesConTienda = [
        { id_user: this.STORE_SENTINEL, nombre: 'FORTUNATO (Tienda)' },
        ...this.clientes
      ];
    });

    forkJoin({
      productos: this.productoService.getProductosConInventarios(),
      insumos: this.insumoService.getInsumosConInventarios(),
      lotesVerdes: this.loteService.getLotesVerdesConInventario(),
      lotesTostados: this.loteTostadoService.getLotesTostadosConInventario(),
      muestras: this.muestraService.getMuestrasConInventario(),
      bolsas: this.bolsaService.getConInventario(),
    }).subscribe({
      next: (resp: UpdateInventoryResponse) => {
        const rows: InventorySearchRow[] = [
          ...this.mapProductos(resp.productos ?? []),
          ...this.mapInsumos(resp.insumos ?? []),
          ...this.mapLotesVerdes(resp.lotesVerdes ?? []),
          ...this.mapLotesTostados(resp.lotesTostados ?? []),
          ...this.mapMuestras(resp.muestras ?? []),
          ...this.mapBolsas(resp.bolsas ?? []),
        ];
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('No se pudo cargar la información del inventario.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: TabTipo): void {
    this.activeTab.set(tab);
  }

  clearFilters(): void {
    this.search.set('');
    this.searchUser.set('');
    this.activeTab.set('TODOS');
    this.onlyWithStock.set(true);
  }

  private totalAlmacenes(items: InventoryByAlmacen[] = []): number {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  private mapProductos(productos: ProductoConInventarios[] = []): InventorySearchRow[] {
    return productos.map((producto) => {
      const almacenes: InventoryByAlmacen[] = (producto?.inventarios ?? []).map((inv) => ({
        id_almacen: inv?.almacen?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.cantidad ?? 0)
      }));
      return {
        id: producto.id_producto, displayName: producto.nombre, reference: producto.id_categoria ?? '',
        tipo: 'PRODUCTO', userId: undefined, stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  private mapInsumos(insumos: InsumoConInventarios[] = []): InventorySearchRow[] {
    return insumos.map((insumo) => {
      const almacenes: InventoryByAlmacen[] = (insumo?.inventarios ?? []).map((inv) => ({
        id_almacen: inv?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.cantidad ?? 0)
      }));
      return {
        id: insumo.id_insumo, displayName: insumo.nombre, reference: insumo.id_categoria ?? '',
        tipo: 'INSUMO', userId: undefined, stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  private mapLotesVerdes(lotes: LoteVerdeConInventario[] = []): InventorySearchRow[] {
    return lotes.map((lote) => {
      const almacenes: InventoryByAlmacen[] = (lote?.inventarioLotes ?? []).map((inv) => ({
        id_almacen: inv?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.cantidad_kg ?? 0)
      }));
      return {
        id: lote.id_lote, displayName: lote.id_lote, reference: lote.productor ?? '',
        tipo: 'LOTE_VERDE', userId: lote.id_user, ownedByStore: lote.owned_by_store,
        stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  private mapLotesTostados(lotes: LoteTostadoConInventario[] = []): InventorySearchRow[] {
    return lotes.map((lote) => {
      const almacenes: InventoryByAlmacen[] = (lote?.inventarioLotesTostados ?? []).map((inv) => ({
        id_almacen: inv?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.cantidad_kg ?? 0)
      }));
      return {
        id: lote.id_lote_tostado, displayName: lote.id_lote_tostado, reference: lote.lote?.productor ?? '',
        tipo: 'LOTE_TOSTADO', userId: lote.id_user, ownedByStore: lote.owned_by_store,
        stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  private mapMuestras(muestras: MuestraConInventario[] = []): InventorySearchRow[] {
    return muestras.map((muestra) => {
      const almacenes: InventoryByAlmacen[] = (muestra?.inventarioMuestras ?? []).map((inv) => ({
        id_almacen: inv?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.peso ?? 0)
      }));
      return {
        id: muestra.id_muestra, displayName: muestra.nombre_muestra || muestra.id_muestra,
        reference: muestra.productor ?? '', tipo: 'MUESTRA', userId: muestra.id_user,
        stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  private mapBolsas(bolsas: BolsaConInventario[] = []): InventorySearchRow[] {
    return bolsas.filter(b => !b.eliminado).map((bolsa) => {
      const inventariosReales: any[] = (bolsa as any).inventarioBolsas ?? bolsa.inventarios ?? [];
      const almacenes: InventoryByAlmacen[] = inventariosReales.map((inv) => ({
        id_almacen: inv?.almacen?.id_almacen ?? inv?.id_almacen ?? '',
        nombre: inv?.almacen?.nombre ?? 'Almacén',
        cantidad: Number(inv?.cantidad ?? 0)
      }));
      return {
        id: bolsa.id_bolsa, displayName: bolsa.id_bolsa, reference: `${bolsa.gramaje}g · ${bolsa.molienda}`,
        tipo: 'BOLSA', userId: bolsa.id_user, stockTotal: this.totalAlmacenes(almacenes), almacenes,
      };
    });
  }

  // ---------- Acciones directas por fila (sin panel intermedio) ----------

  ajustar(row: InventorySearchRow): void {
    this.router.navigate(['/inventory/actualizar/ajustar-stock'], { state: { row } });
  }

  trasladar(row: InventorySearchRow): void {
    if (!row.almacenes.length) {
      this.uiService.alert('warning', 'Atención', 'La entidad no tiene almacenes registrados');
      return;
    }
    this.router.navigate(['/inventory/actualizar/trasladar-stock'], { state: { row } });
  }
}