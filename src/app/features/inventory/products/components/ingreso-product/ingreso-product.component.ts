import { AlmacenService } from './../../../almacenes/service/almacen.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../service/producto.service';
import { Almacen } from '../../../../../shared/models/almacen';
import { Producto } from '../../../../../shared/models/producto';
import { IngresoProductoService } from '../../service/ingreso-producto.service';
import { IngresoProducto } from '../../../../../shared/models/ingreso-producto';

// ✅ Form de creación (request). NO uses IngresoProducto aquí.
export interface CreateIngresoProductoForm {
  id_producto: string;
  id_variante: string | null;
  id_almacen: string;
  cantidad: number;
  precio_compra: number;
}

@Component({
  selector: 'ingreso-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-product.component.html',
})
export class IngresoProductComponent implements OnInit {

  @Output() close = new EventEmitter<void>();   
  @Output() saved = new EventEmitter<void>(); 

  loading = false; // ✅ para el botón

  almacenes: Almacen[] = [];
  productos: Producto[] = [];

  // ✅ SOLO lo que envías al backend
  form: IngresoProducto = {
    id_ingreso: '',
    id_producto: '',
    id_almacen: '',
    cantidad: 0,
    precio_compra: 0,
    fecha_ingreso: '',
    id_user: ''
  };

  constructor(
    private almacenService: AlmacenService,
    private productoService: ProductoService,
    private ingresoService: IngresoProductoService
  ) {}

  ngOnInit(): void {
    this.getAlmacenes();
    this.getProductos();
  }

  getAlmacenes() {
    this.almacenService.getAlmacenesActivos().subscribe({
      next: (data) => this.almacenes = data,
      error: (err) => console.error('Error al cargar almacenes', err)
    });
  }

  getProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  // ✅ filtro PROD011+
  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      const n = parseInt(String((p as any).id_producto).replace('PROD', ''), 10);
      return Number.isFinite(n) && n >= 11;
    });
  }

  save() {
    if (this.loading) return;
    if (!this.form.id_producto || !this.form.id_almacen || this.form.cantidad <= 0) return;

    this.loading = true;

    this.ingresoService.createIngreso(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al crear ingreso', err);
      }
    });
  }
}