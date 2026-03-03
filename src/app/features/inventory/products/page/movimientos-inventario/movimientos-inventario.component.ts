import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Search } from 'lucide-angular';
import { IngresoProductoService } from '../../service/ingreso-producto.service';
import { IngresoProducto } from '../../../../../shared/models/ingreso-producto';


// Si quieres mostrar el nombre del producto, puedes cargarlo por ProductoService con id_producto
// import { ProductoService } from '../service/producto.service';
// import { Producto } from '../../../../shared/models/producto';

type TipoFiltro = 'ALL' | 'INGRESO' | 'SALIDA' | 'TRASLADO' | 'AJUSTE';

// Para que el HTML sea igual al ejemplo (helpers getTipo/getEntidad/etc.)
type MovimientoRow = {
  tipo: 'INGRESO';
  entidad: 'PRODUCTO';
  id_entidad: string;
  cantidad: number;
  comentario?: string | null;
  usuario: string;
  fecha: string; // ISO
  id_almacen: string;
  precio_compra: number;
};

@Component({
  selector: 'producto-movimientos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './movimientos-inventario.component.html',
})
export class ProductoMovimientosPageComponent implements OnInit {
  ArrowLeft = ArrowLeft;
  Search = Search;

  id_producto = '';

  // opcional si quieres mostrar en header
  // producto?: Producto;

  loading = false;
  errorMsg: string | null = null;

  // filtros
  q = '';
  tipo: TipoFiltro = 'ALL';

  // paginación
  page = 1;
  pageSize = 20;

  // data
  rows: MovimientoRow[] = [];
  filtered: MovimientoRow[] = [];
  pageRows: MovimientoRow[] = [];

  total = 0;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private ingresoService: IngresoProductoService,
    // private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.id_producto = this.route.snapshot.paramMap.get('id_producto') || '';
    if (!this.id_producto) {
      this.errorMsg = 'No se encontró el producto.';
      return;
    }

    // opcional: cargar nombre del producto
    // this.productoService.getById(this.id_producto).subscribe({ next: p => this.producto = p });

    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = null;

    this.ingresoService.getByProducto(this.id_producto).subscribe({
      next: (data: IngresoProducto[]) => {
        // map -> MovimientoRow
        this.rows = (data ?? [])
          .map((ing) => ({
            tipo: 'INGRESO',
            entidad: 'PRODUCTO',
            id_entidad: ing.id_producto,
            cantidad: ing.cantidad,
            comentario: `Almacén: ${ing.id_almacen} · Precio: ${ing.precio_compra}`,
            usuario: ing.id_user,
            fecha: ing.fecha_ingreso,
            id_almacen: ing.id_almacen,
            precio_compra: ing.precio_compra,
          }))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        this.onChangeFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo cargar el histórico de movimientos.';
        this.rows = [];
        this.filtered = [];
        this.pageRows = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }

  onChangeFilters() {
    this.page = 1;
    this.applyFiltersAndPaginate();
  }

  private applyFiltersAndPaginate() {
    const q = (this.q || '').trim().toLowerCase();

    this.filtered = this.rows.filter((m) => {
      // filtro tipo (por ahora solo INGRESO)
      if (this.tipo !== 'ALL' && m.tipo !== this.tipo) return false;

      if (!q) return true;

      const haystack = [
        m.tipo,
        m.entidad,
        m.id_entidad,
        m.comentario ?? '',
        m.usuario,
        m.id_almacen,
        String(m.cantidad),
        String(m.precio_compra),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });

    this.total = this.filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));

    if (this.page > this.totalPages) this.page = this.totalPages;

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pageRows = this.filtered.slice(start, end);
  }

  prev() {
    if (this.page <= 1) return;
    this.page--;
    this.applyFiltersAndPaginate();
  }

  next() {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.applyFiltersAndPaginate();
  }

  // Helpers usados por el HTML (misma firma que tu ejemplo)
  getTipo(m: MovimientoRow) {
    return m.tipo;
  }
  getEntidad(m: MovimientoRow) {
    return m.entidad;
  }
  getIdEntidad(m: MovimientoRow) {
    return m.id_entidad;
  }
  getCantidad(m: MovimientoRow) {
    return m.cantidad;
  }
  getComentario(m: MovimientoRow) {
    return m.comentario;
  }
  getUsuario(m: MovimientoRow) {
    return m.usuario;
  }
  getFecha(m: MovimientoRow) {
    return m.fecha ? new Date(m.fecha) : null;
  }
}