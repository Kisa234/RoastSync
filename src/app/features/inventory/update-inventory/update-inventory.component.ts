import { UserService } from './../../users/service/users-service.service';
import { AlmacenService } from './../almacenes/service/almacen.service';
import { CommonModule, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  LucideAngularModule,
  Search,
  Package,
  Warehouse,
  Pencil,
  RefreshCcw,
  Filter,
  Boxes,
  User
} from 'lucide-angular';

import { ProductoService } from '../products/service/producto.service';
import { InsumoService } from '../insumo/service/insumo.service';
import { LoteService } from '../lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../lotes-tostados/service/lote-tostado.service';
import { MuestraService } from '../muestras/service/muestra.service';

import { LoteVerdeConInventario } from '../../../shared/models/lote';
import { LoteTostadoConInventario } from '../../../shared/models/lote-tostado';
import { MuestraConInventario } from '../../../shared/models/muestra';
import { CategoriaNombrePipe } from "../../../shared/pipes/categoria-nombre.pipe";
import { UserNamePipe } from '../../../shared/pipes/user-name-pipe.pipe';
import { CategoriaInsumoPipe } from '../../../shared/pipes/categoria-insumo.pipe';
import { ProductoConInventarios } from '../../../shared/models/producto';
import { InsumoConInventarios } from '../../../shared/models/insumo';
import { User as UserEntity } from '../../../shared/models/user';
import { SelectSearchComponent } from "../../../shared/components/select-search/select-search.component";

type InventoryEntityType =
  | 'TODOS'
  | 'INSUMO'
  | 'LOTE_VERDE'
  | 'LOTE_TOSTADO'
  | 'MUESTRA'
  | 'PRODUCTO';

interface InventoryByAlmacen {
  id_almacen: string;
  nombre: string;
  cantidad: number;
}

type InventoryRaw =
  | ProductoConInventarios
  | InsumoConInventarios
  | LoteVerdeConInventario
  | LoteTostadoConInventario
  | MuestraConInventario;

interface InventorySearchRow {
  id: string;
  displayName: string;
  reference: string;
  tipo: Exclude<InventoryEntityType, 'TODOS'>;
  userId?: string;
  stockTotal: number;
  almacenes: InventoryByAlmacen[];
  raw: InventoryRaw;
}

interface UpdateInventoryResponse {
  productos: ProductoConInventarios[] | null;
  insumos: InsumoConInventarios[] | null;
  lotesVerdes: LoteVerdeConInventario[] | null;
  lotesTostados: LoteTostadoConInventario[] | null;
  muestras: MuestraConInventario[] | null;
}

@Component({
  selector: 'app-update-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    LucideAngularModule,
    CategoriaNombrePipe,
    CategoriaInsumoPipe,
    UserNamePipe,
    SelectSearchComponent
  ],
  templateUrl: './update-inventory.component.html',
  styles: []
})
export class UpdateInventoryComponent implements OnInit {
  readonly Search = Search;
  readonly Package = Package;
  readonly Warehouse = Warehouse;
  readonly Pencil = Pencil;
  readonly RefreshCcw = RefreshCcw;
  readonly Filter = Filter;
  readonly Boxes = Boxes;
  readonly User = User;

  loading = signal(true);
  error = signal('');
  selectedRow = signal<InventorySearchRow | null>(null);

  clientes: UserEntity[] = [];

  search = signal('');
  searchUser = signal('');
  selectedType = signal<InventoryEntityType>('TODOS');
  onlyWithStock = signal(false);
  onlyMultiWarehouse = signal(false);

  rows = signal<InventorySearchRow[]>([]);

  readonly filteredRows = computed(() => {
    let data = this.rows();

    const general = this.search().trim().toLowerCase();
    const user = this.searchUser().trim().toLowerCase();
    const type = this.selectedType();
    const withStock = this.onlyWithStock();
    const multi = this.onlyMultiWarehouse();

    if (type !== 'TODOS') {
      data = data.filter(row => row.tipo === type);
    }

    if (general) {
      data = data.filter(row =>
        row.id.toLowerCase().includes(general) ||
        row.displayName.toLowerCase().includes(general) ||
        row.reference.toLowerCase().includes(general)
      );
    }

    if (user) {
      data = data.filter(row =>
        (row.userId ?? '').toLowerCase().includes(user)
      );
    }

    if (withStock) {
      data = data.filter(row => row.stockTotal > 0);
    }

    if (multi) {
      data = data.filter(
        row => row.almacenes.filter(almacen => almacen.cantidad > 0).length > 1
      );
    }

    return [...data].sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  constructor(
    private productoService: ProductoService,
    private insumoService: InsumoService,
    private loteService: LoteService,
    private loteTostadoService: LoteTostadoService,
    private muestraService: MuestraService,
    private almacenService: AlmacenService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUsers().subscribe(
      users => {
        this.clientes = users;
      }),

      forkJoin({
        productos: this.productoService.getProductosConInventarios(),
        insumos: this.insumoService.getInsumosConInventarios(),
        lotesVerdes: this.loteService.getLotesVerdesConInventario(),
        lotesTostados: this.loteTostadoService.getLotesTostadosConInventario(),
        muestras: this.muestraService.getMuestrasConInventario(),
      }).subscribe({
        next: (resp: UpdateInventoryResponse) => {
          const rows: InventorySearchRow[] = [
            ...this.mapProductos(resp.productos ?? []),
            ...this.mapInsumos(resp.insumos ?? []),
            ...this.mapLotesVerdes(resp.lotesVerdes ?? []),
            ...this.mapLotesTostados(resp.lotesTostados ?? []),
            ...this.mapMuestras(resp.muestras ?? [])
          ];

          this.rows.set(rows);
          this.selectedRow.set(rows.length > 0 ? rows[0] : null);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          console.error(err);
          this.error.set('No se pudo cargar la información del inventario.');
          this.loading.set(false);
        }
      });
  }

  selectRow(row: InventorySearchRow): void {
    this.selectedRow.set(row);
  }

  clearFilters(): void {
    this.search.set('');
    this.searchUser.set('');
    this.selectedType.set('TODOS');
    this.onlyWithStock.set(false);
    this.onlyMultiWarehouse.set(false);
  }

  getTypeLabel(tipo: InventorySearchRow['tipo']): string {
    switch (tipo) {
      case 'INSUMO':
        return 'Insumo';
      case 'LOTE_VERDE':
        return 'Lote Verde';
      case 'LOTE_TOSTADO':
        return 'Lote Tostado';
      case 'MUESTRA':
        return 'Muestra';
      case 'PRODUCTO':
        return 'Producto';
      default:
        return tipo;
    }
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
        id: producto.id_producto,
        displayName: producto.nombre,
        reference: producto.id_categoria ?? '',
        tipo: 'PRODUCTO',
        userId: undefined,
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: producto
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
        id: insumo.id_insumo,
        displayName: insumo.nombre,
        reference: insumo.id_categoria ?? '',
        tipo: 'INSUMO',
        userId: undefined,
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: insumo
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
        id: lote.id_lote,
        displayName: lote.id_lote,
        reference: lote.productor ?? '',
        tipo: 'LOTE_VERDE',
        userId: lote.id_user,
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: lote
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
        id: lote.id_lote_tostado,
        displayName: lote.id_lote_tostado,
        reference: lote.lote?.productor ?? '',
        tipo: 'LOTE_TOSTADO',
        userId: lote.id_user,
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: lote
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
        id: muestra.id_muestra,
        displayName: muestra.nombre_muestra || muestra.id_muestra,
        reference: muestra.productor ?? '',
        tipo: 'MUESTRA',
        userId: muestra.id_user,
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: muestra
      };
    });
  }

  onUpdateSelected(): void {
    const row = this.selectedRow();
    if (!row) return;

    console.log('Actualizar inventario de:', row);
  }
}