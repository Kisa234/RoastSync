import { AlmacenService } from './../almacenes/service/almacen.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
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
  Boxes
} from 'lucide-angular';
import { ProductoService } from '../products/service/producto.service';
import { InventarioProductoService } from '../products/service/inventario-producto.service';

import { InsumoService } from '../insumo/service/insumo.service';
import { InventarioInsumoService } from '../insumo/service/inventario-insumo.service';

import { LoteService } from '../lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../lotes-tostados/service/lote-tostado.service';

import { MuestraService } from '../muestras/service/muestra.service';

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

interface InventorySearchRow {
  id: string;
  nombre: string;
  tipo: Exclude<InventoryEntityType, 'TODOS'>;
  subtitulo?: string;
  categoria?: string;
  stockTotal: number;
  almacenes: InventoryByAlmacen[];
  raw: any;
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
    LucideAngularModule
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

  loading = signal(true);
  error = signal('');
  selectedRow = signal<InventorySearchRow | null>(null);

  search = signal('');
  searchId = signal('');
  searchName = signal('');
  selectedType = signal<InventoryEntityType>('TODOS');
  onlyWithStock = signal(false);
  onlyMultiWarehouse = signal(false);

  rows = signal<InventorySearchRow[]>([]);

  readonly filteredRows = computed(() => {
    let data = this.rows();

    const general = this.search().trim().toLowerCase();
    const id = this.searchId().trim().toLowerCase();
    const name = this.searchName().trim().toLowerCase();
    const type = this.selectedType();
    const withStock = this.onlyWithStock();
    const multi = this.onlyMultiWarehouse();

    if (type !== 'TODOS') {
      data = data.filter(r => r.tipo === type);
    }

    if (general) {
      data = data.filter(r =>
        r.id.toLowerCase().includes(general) ||
        r.nombre.toLowerCase().includes(general) ||
        (r.subtitulo || '').toLowerCase().includes(general) ||
        (r.categoria || '').toLowerCase().includes(general)
      );
    }

    if (id) {
      data = data.filter(r => r.id.toLowerCase().includes(id));
    }

    if (name) {
      data = data.filter(r =>
        r.nombre.toLowerCase().includes(name) ||
        (r.subtitulo || '').toLowerCase().includes(name)
      );
    }

    if (withStock) {
      data = data.filter(r => r.stockTotal > 0);
    }

    if (multi) {
      data = data.filter(r => r.almacenes.filter(a => a.cantidad > 0).length > 1);
    }

    return [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  constructor(
    private productoService: ProductoService,
    private inventarioProductoService: InventarioProductoService,

    private insumoService: InsumoService,
    private inventarioInsumoService: InventarioInsumoService,

    private loteService: LoteService,
    private loteTostadoService: LoteTostadoService,

    private muestraService: MuestraService,

    private almacenService: AlmacenService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      productos: this.productoService.getProductos(),
      inventarioProductos: this.inventarioProductoService.getInventarios(),

      insumos: this.insumoService.getAll(),
      inventarioInsumos: this.inventarioInsumoService.getInventarios(),

      lotesVerdes: this.loteService.getLotesVerdesConInventario(),
      lotesTostados: this.loteTostadoService.getLotesTostadosConInventario(),
      muestras: this.muestraService.getMuestrasConInventario(),
    }).subscribe({
      next: (resp: any) => {
        const rows: InventorySearchRow[] = [
          ...this.mapProductos(resp.productos, resp.inventarioProductos),
          ...this.mapInsumos(resp.insumos, resp.inventarioInsumos),
          ...this.mapLotesVerdes(resp.lotesVerdes),
          ...this.mapLotesTostados(resp.lotesTostados),
          ...this.mapMuestras(resp.muestras)
        ];

        this.rows.set(rows);
        this.selectedRow.set(rows.length ? rows[0] : null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cargar la información del inventario.');
        this.loading.set(false);
      }
    });
  }

  selectRow(row: InventorySearchRow) {
    this.selectedRow.set(row);
  }

  clearFilters() {
    this.search.set('');
    this.searchId.set('');
    this.searchName.set('');
    this.selectedType.set('TODOS');
    this.onlyWithStock.set(false);
    this.onlyMultiWarehouse.set(false);
  }

  getTypeLabel(tipo: InventorySearchRow['tipo']): string {
    switch (tipo) {
      case 'INSUMO': return 'Insumo';
      case 'LOTE_VERDE': return 'Lote Verde';
      case 'LOTE_TOSTADO': return 'Lote Tostado';
      case 'MUESTRA': return 'Muestra';
      case 'PRODUCTO': return 'Producto';
      default: return tipo;
    }
  }

  private buildAlmacenes(inventarios: any[], entityKey: string, entityId: string): InventoryByAlmacen[] {
    return (inventarios || [])
      .filter(inv => inv[entityKey] === entityId)
      .map(inv => ({
        id_almacen: inv.id_almacen,
        nombre: inv.almacen?.nombre || 'Almacén',
        cantidad: Number(inv.peso ?? inv.cantidad ?? 0)
      }));
  }

  private buildAlmacenesFromEmbedded(inventarios: any[] = []): InventoryByAlmacen[] {
    return (inventarios || []).map(inv => ({
      id_almacen: inv.id_almacen,
      nombre: inv.almacen?.nombre || 'Almacén',
      cantidad: Number(inv.peso ?? inv.cantidad ?? 0)
    }));
  }

  private totalAlmacenes(items: InventoryByAlmacen[]): number {
    return items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
  }

  private mapProductos(productos: any[], inventarios: any[]): InventorySearchRow[] {
    return productos.map(p => {
      const almacenes = this.buildAlmacenes(inventarios, 'id_producto', p.id_producto);
      return {
        id: p.id_producto,
        nombre: p.nombre,
        tipo: 'PRODUCTO',
        subtitulo: p.marca?.nombre || '',
        categoria: p.categoria?.nombre || '',
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: p
      };
    });
  }

  private mapInsumos(insumos: any[], inventarios: any[]): InventorySearchRow[] {
    return insumos.map(i => {
      const almacenes = this.buildAlmacenes(inventarios, 'id_insumo', i.id_insumo);
      return {
        id: i.id_insumo,
        nombre: i.nombre,
        tipo: 'INSUMO',
        subtitulo: i.marca?.nombre || '',
        categoria: i.categoria?.nombre || '',
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: i
      };
    });
  }

  private mapLotesVerdes(lotes: any[]): InventorySearchRow[] {
    return lotes.map(l => {
      const almacenes = this.buildAlmacenesFromEmbedded(
        l.inventarios || l.inventario || l.inventarioLote || []
      );

      return {
        id: l.id_lote,
        nombre: l.productor || l.proveedor || l.id_lote,
        tipo: 'LOTE_VERDE',
        subtitulo: `${l.finca || ''}${l.proceso ? ' - ' + l.proceso : ''}`.trim(),
        categoria: l.departamento || '',
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: l
      };
    });
  }

  private mapLotesTostados(lotes: any[]): InventorySearchRow[] {
    return lotes.map(l => {
      const almacenes = this.buildAlmacenesFromEmbedded(
        l.inventarios || l.inventario || l.inventarioLoteTostado || []
      );

      return {
        id: l.id_lote_tostado,
        nombre: l.id_lote_tostado,
        tipo: 'LOTE_TOSTADO',
        subtitulo: l.perfil_tostado || '',
        categoria: l.id_lote || '',
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: l
      };
    });
  }

  private mapMuestras(muestras: any[]): InventorySearchRow[] {
    return muestras.map(m => {
      const almacenes = this.buildAlmacenesFromEmbedded(
        m.inventarios || m.inventario || m.inventarioMuestra || []
      );

      return {
        id: m.id_muestra,
        nombre: m.nombre_muestra || m.id_muestra,
        tipo: 'MUESTRA',
        subtitulo: m.productor || m.proveedor || '',
        categoria: m.proceso || '',
        stockTotal: this.totalAlmacenes(almacenes),
        almacenes,
        raw: m
      };
    });
  }

  onUpdateSelected() {
    const row = this.selectedRow();
    if (!row) return;

    console.log('Actualizar inventario de:', row);
  }
}