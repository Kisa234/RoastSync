import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Package, Tag, Eye, RefreshCcw } from 'lucide-angular';
import { Observable, Subject, combineLatest, map, shareReplay, startWith, switchMap } from 'rxjs';
import { AddProductComponent } from '../../component/add-product/add-product.component';
import { AddProductSkuComponent } from '../../component/add-product-sku/add-product-sku.component';
import { ViewStickerComponent } from '../../component/view-sticker/view-sticker.component';
import { ProductoSku, TMolienda } from '../../../../shared/models/productoSku';
import { Producto } from '../../../../shared/models/producto';
import { ProductoService } from '../../service/producto.service';
import { ProductoSkuService } from '../../service/producto-sku.service';


type MaquilaRow = {
  id_producto: string;
  nombre_producto: string;
  id_lote_tostado: string;
  gramaje: number;
  molienda: TMolienda;
  cantidad: number;
  peso_total_gr: number;
  last_update: string;
};

@Component({
  selector: 'maquila-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AddProductComponent,
    AddProductSkuComponent,
    ViewStickerComponent
  ],
  templateUrl: './maquila.page.component.html'
})
export class MaquilaPageComponent {
  // icons
  readonly Plus = Plus;
  readonly Package = Package;
  readonly Tag = Tag;
  readonly Eye = Eye;
  readonly RefreshCcw = RefreshCcw;

  // ui state
  showAddProduct = false;
  showAddSku = false;
  showSticker = false;

  search = '';
  selectedSticker: any = null;

  private reload$ = new Subject<void>();

  productos$: Observable<Producto[]> = this.reload$.pipe(
    startWith(void 0),
    switchMap(() => this.productoService.list()),
    shareReplay(1)
  );

  skus$: Observable<ProductoSku[]> = this.reload$.pipe(
    startWith(void 0),
    switchMap(() => this.skuService.list()),
    shareReplay(1)
  );

  inv$: Observable<MaquilaRow[]> = combineLatest([this.productos$, this.skus$]).pipe(
    map(([productos, skus]) => {
      const nameById = new Map(productos.map(p => [p.id_producto, p.nombre]));
      const mapAgg = new Map<string, MaquilaRow>();

      for (const s of skus) {
        const key = `${s.id_producto}|${s.id_lote_tostado}|${s.gramaje}|${s.molienda}`;
        const nombre = nameById.get(s.id_producto) ?? '—';
        const last = s.fecha_editado ?? s.fecha_registro;

        if (!mapAgg.has(key)) {
          mapAgg.set(key, {
            id_producto: s.id_producto,
            nombre_producto: nombre,
            id_lote_tostado: s.id_lote_tostado,
            gramaje: s.gramaje,
            molienda: s.molienda,
            cantidad: s.cantidad,
            peso_total_gr: s.gramaje * s.cantidad,
            last_update: last
          });
        } else {
          const row = mapAgg.get(key)!;
          row.cantidad += s.cantidad;
          row.peso_total_gr += s.gramaje * s.cantidad;
          // conserva el más reciente
          row.last_update = (new Date(last) > new Date(row.last_update)) ? last : row.last_update;
        }
      }

      // filtro por búsqueda libre
      const term = this.search.trim().toLowerCase();
      let rows = Array.from(mapAgg.values());
      if (term) {
        rows = rows.filter(r =>
          r.nombre_producto.toLowerCase().includes(term) ||
          r.id_lote_tostado.toLowerCase().includes(term) ||
          String(r.gramaje).includes(term) ||
          r.molienda.toLowerCase().includes(term)
        );
      }

      // orden por nombre y luego por gramaje
      rows.sort((a, b) =>
        a.nombre_producto.localeCompare(b.nombre_producto) ||
        a.gramaje - b.gramaje ||
        a.molienda.localeCompare(b.molienda)
      );
      return rows;
    }),
    shareReplay(1)
  );

  totals$ = this.inv$.pipe(
    map(rows => {
      const unidades = rows.reduce((acc, r) => acc + r.cantidad, 0);
      const peso_gr = rows.reduce((acc, r) => acc + r.peso_total_gr, 0);
      return { unidades, peso_gr, peso_kg: peso_gr / 1000 };
    })
  );

  constructor(
    private productoService: ProductoService,
    private skuService: ProductoSkuService
  ) {}

  openAddProduct() { this.showAddProduct = true; }
  openAddSku() { this.showAddSku = true; }
  closeSticker() { this.showSticker = false; this.selectedSticker = null; }

  onProductCreated() { this.showAddProduct = false; this.reload(); }
  onSkuCreated() { this.showAddSku = false; this.reload(); }

  onViewSticker(row: MaquilaRow) {
    this.selectedSticker = row;
    this.showSticker = true;
  }

  reload() { this.reload$.next(); }
  clearSearch() { this.search = ''; this.reload(); }

  trackRow(_i: number, r: MaquilaRow) {
    return `${r.id_producto}|${r.id_lote_tostado}|${r.gramaje}|${r.molienda}`;
  }
}
