import { CommonModule, DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Package, Warehouse, CalendarDays } from 'lucide-angular';

import { InventarioProducto } from '../../../../../shared/models/inventario-producto';
import { ProductoService } from '../../service/producto.service';
import { ProductoConInventarios } from '../../../../../shared/models/producto';
import { CategoriaNombrePipe } from "../../../../../shared/pipes/categoria-nombre.pipe";

@Component({
  selector: 'app-movimientos-producto-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
    RouterModule,
    LucideAngularModule,
    CategoriaNombrePipe
],
  templateUrl: './movimientos-producto.component.html',
})
export class MovimientosProductoPageComponent implements OnInit {
  producto: ProductoConInventarios | null = null;
  inventariosProducto: InventarioProducto[] = [];

  loading = true;
  error = '';

  ArrowLeft = ArrowLeft;
  Package = Package;
  Warehouse = Warehouse;
  CalendarDays = CalendarDays;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el id del producto.';
      this.loading = false;
      return;
    }

    this.loadData(id);
  }

  loadData(id: string): void {
    this.loading = true;
    this.error = '';

    this.productoService.getProductoConInventariosById(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.inventariosProducto = producto.inventarios ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando movimientos del producto', err);
        this.error = 'No se pudo cargar la información del producto.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/productos']);
  }

  trackByInventario(_: number, item: InventarioProducto): string {
    return item.id_inventario;
  }

  get stockActual(): number {
    if (!this.producto) return 0;
    return this.producto.stock_total ?? 0;
  }

  get totalInventarios(): number {
    return this.inventariosProducto.length;
  }

  get inventariosOrdenados(): InventarioProducto[] {
    return [...this.inventariosProducto].sort((a, b) => {
      const fa = new Date(a.fecha_registro).getTime();
      const fb = new Date(b.fecha_registro).getTime();
      return fb - fa;
    });
  }

  get fechaPrimerRegistro(): string | null {
    if (!this.producto?.fecha_primer_registro) return null;
    return String(this.producto.fecha_primer_registro);
  }

  get stockInicialReferencial(): number {
    if (!this.producto) return 0;
    return this.producto.stock_inicial_referencial ?? 0;
  }
}