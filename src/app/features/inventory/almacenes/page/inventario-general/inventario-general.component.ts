import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InventarioGeneralRow } from '../../../../../shared/models/inventario-general-row';
import { InventarioProductoService } from '../../../products/service/inventario-producto.service';
import { InventarioLoteService } from '../../../lotes-verdes/service/inventario-lote.service';
import { InventarioInsumoService } from '../../../insumo/service/inventario-insumo.service';
import { InventarioMuestraService } from '../../../muestras/service/inventario-muestra.service';
import { InventarioLoteTostadoService } from '../../../lotes-tostados/service/inventario-lote-tostado.service';

@Component({
  selector: 'app-inventario-general',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-general.component.html',
})
export class InventarioGeneralComponent implements OnInit {
  idAlmacen = '';
  nombreAlmacen = 'Almacén';

  loading = false;
  error = '';

  busqueda = signal('');
  filtroEntidad = signal('TODOS');

  rows = signal<InventarioGeneralRow[]>([]);

  filteredRows = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const entidad = this.filtroEntidad();

    return this.rows().filter((row) => {
      const matchesEntidad =
        entidad === 'TODOS' ? true : row.tipoEntidad === entidad;

      const searchable = [
        row.tipoEntidad,
        row.idEntidad,
        row.nombre,
        row.presentacion ?? '',
        row.unidad ?? '',
        row.almacen ?? '',
        row.comentario ?? '',
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);

      return matchesEntidad && matchesSearch;
    });
  });

  totalProductos = computed(() =>
    this.rows().filter((x) => x.tipoEntidad === 'PRODUCTO').length
  );

  totalInsumos = computed(() =>
    this.rows().filter((x) => x.tipoEntidad === 'INSUMO').length
  );

  totalMuestras = computed(() =>
    this.rows().filter((x) => x.tipoEntidad === 'MUESTRA').length
  );

  totalLotesVerdes = computed(() =>
    this.rows().filter((x) => x.tipoEntidad === 'LOTE_VERDE').length
  );

  totalLotesTostados = computed(() =>
    this.rows().filter((x) => x.tipoEntidad === 'LOTE_TOSTADO').length
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly inventarioProductoService: InventarioProductoService,
    private readonly inventarioLoteService: InventarioLoteService,
    private readonly inventarioInsumoService: InventarioInsumoService,
    private readonly inventarioMuestraService: InventarioMuestraService,
    private readonly inventarioLoteTostadoService: InventarioLoteTostadoService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idAlmacen =
        params.get('id') ||
        params.get('id_almacen') ||
        '';

      this.nombreAlmacen =
        this.route.snapshot.queryParamMap.get('nombre') || 'Almacén';

      if (!this.idAlmacen) {
        this.error = 'No se encontró el id del almacén.';
        this.rows.set([]);
        return;
      }

      this.loadInventario();
    });
  }

  volver() {
    this.router.navigate(['/inventory/almacen']);
  }

  loadInventario() {
    this.loading = true;
    this.error = '';

    forkJoin({
      productos: this.inventarioProductoService.getInventarios(),
      lotesVerdes: this.inventarioLoteService.getByAlmacen(this.idAlmacen),
      insumos: this.inventarioInsumoService.getByAlmacen(this.idAlmacen),
      muestras: this.inventarioMuestraService.getByAlmacen(this.idAlmacen),
      lotesTostados: this.inventarioLoteTostadoService.getByAlmacen(this.idAlmacen),
    }).subscribe({
      next: (resp) => {
        const productos = (resp.productos || [])
          .filter((x: any) =>
            x.id_almacen === this.idAlmacen ||
            x.almacen?.id_almacen === this.idAlmacen ||
            x.id_warehouse === this.idAlmacen ||
            x.almacen?.id === this.idAlmacen
          )
          .map((x: any) => this.mapProducto(x));

        const lotesVerdes = (resp.lotesVerdes || []).map((x: any) =>
          this.mapLoteVerde(x)
        );

        const insumos = (resp.insumos || []).map((x: any) =>
          this.mapInsumo(x)
        );

        const muestras = (resp.muestras || []).map((x: any) =>
          this.mapMuestra(x)
        );

        const lotesTostados = (resp.lotesTostados || []).map((x: any) =>
          this.mapLoteTostado(x)
        );

        this.rows.set([
          ...productos,
          ...insumos,
          ...muestras,
          ...lotesVerdes,
          ...lotesTostados,
        ]);
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el inventario general.';
        this.rows.set([]);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private mapProducto(x: any): InventarioGeneralRow {
    return {
      tipoEntidad: 'PRODUCTO',
      idInventario: x.id_inventario || '',
      idEntidad: x.id_producto || x.producto?.id_producto || '',
      nombre: x.producto?.nombre || x.nombre || 'Producto sin nombre',
      presentacion: x.producto?.presentacion || x.presentacion || '',
      cantidad: Number(x.cantidad ?? 0),
      unidad: x.unidad_medida || x.producto?.unidad_medida || 'und',
      almacen: x.almacen?.nombre || this.nombreAlmacen,
      comentario: x.comentario || '',
      raw: x,
    };
  }

  private mapInsumo(x: any): InventarioGeneralRow {
    return {
      tipoEntidad: 'INSUMO',
      idInventario: x.id_inventario || '',
      idEntidad: x.id_insumo || x.insumo?.id_insumo || '',
      nombre: x.insumo?.nombre || x.nombre || 'Insumo sin nombre',
      presentacion: x.insumo?.descripcion || x.descripcion || '',
      cantidad: Number(x.cantidad ?? 0),
      unidad: x.insumo?.unidad_medida || x.unidad_medida || 'und',
      almacen: x.almacen?.nombre || this.nombreAlmacen,
      comentario: '',
      raw: x,
    };
  }

  private mapMuestra(x: any): InventarioGeneralRow {
    return {
      tipoEntidad: 'MUESTRA',
      idInventario: x.id_inventario || '',
      idEntidad: x.id_muestra || x.muestra?.id_muestra || '',
      nombre: x.muestra?.codigo || x.muestra?.nombre || 'Muestra',
      presentacion: x.muestra?.tipo || '',
      cantidad: Number(x.peso ?? 0),
      unidad: 'kg',
      almacen: x.almacen?.nombre || this.nombreAlmacen,
      comentario: '',
      raw: x,
    };
  }

  private mapLoteVerde(x: any): InventarioGeneralRow {
    return {
      tipoEntidad: 'LOTE_VERDE',
      idInventario: x.id_inventario || '',
      idEntidad: x.id_lote || x.lote?.id_lote || '',
      nombre: x.lote?.nombre || x.lote?.codigo || x.id_lote || 'Lote verde',
      presentacion: x.lote?.tipo_lote || 'Lote Verde',
      cantidad: Number(x.cantidad_kg ?? 0),
      unidad: 'kg',
      almacen: x.almacen?.nombre || this.nombreAlmacen,
      comentario: '',
      raw: x,
    };
  }

  private mapLoteTostado(x: any): InventarioGeneralRow {
    return {
      tipoEntidad: 'LOTE_TOSTADO',
      idInventario: x.id_inventario || '',
      idEntidad: x.id_lote_tostado || x.loteTostado?.id_lote_tostado || '',
      nombre:
        x.loteTostado?.nombre ||
        x.loteTostado?.codigo ||
        x.id_lote_tostado ||
        'Lote tostado',
      presentacion: 'Lote Tostado',
      cantidad: Number(x.cantidad_kg ?? 0),
      unidad: 'kg',
      almacen: x.almacen?.nombre || this.nombreAlmacen,
      comentario: '',
      raw: x,
    };
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'PRODUCTO':
        return 'bg-blue-100 text-blue-700';
      case 'INSUMO':
        return 'bg-amber-100 text-amber-700';
      case 'MUESTRA':
        return 'bg-purple-100 text-purple-700';
      case 'LOTE_VERDE':
        return 'bg-emerald-100 text-emerald-700';
      case 'LOTE_TOSTADO':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
