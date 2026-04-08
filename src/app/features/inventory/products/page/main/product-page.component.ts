import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Plus, FolderPlus, Eye, Edit2, LucideAngularModule } from 'lucide-angular';
import { CategoriasComponent } from '../../components/categorias/categorias.component';
import { ProductosComponent } from '../../components/productos/productos.component';
import { IngresoProductComponent } from '../../components/ingreso-product/ingreso-product.component';
import { Producto } from '../../../../../shared/models/producto';
import { Categoria } from '../../../../../shared/models/categoria';
import { InventarioProducto } from '../../../../../shared/models/inventario-producto';
import { ProductoService } from '../../service/producto.service';
import { CategoriaProductoService } from '../../service/categoria-producto.service';
import { InventarioProductoService } from '../../service/inventario-producto.service';
import { Router } from '@angular/router';


type ProductoConStock = Producto & { inventarios: InventarioProducto[]; totalStock: number };

@Component({
  selector: 'app-product-page',
  standalone: true,
  templateUrl: './product-page.component.html',
  imports: [
    LucideAngularModule,
    CommonModule,
    FormsModule,
    CategoriasComponent,
    ProductosComponent,
    IngresoProductComponent,
  ],
})
export class ProductPageComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  inventarios: InventarioProducto[] = [];

  // ✅ lista base y lista filtrada
  productosConStockAll: ProductoConStock[] = [];
  productosConStock: ProductoConStock[] = [];

  selectedCategoria: string = '';

  Plus = Plus;
  FolderPlus = FolderPlus;
  Eye = Eye;
  Edit2 = Edit2;

  showProductos = false;
  showCategorias = false;
  showIngresoProducto = false;


  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private inventarioService: InventarioProductoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
    this.loadInventarios();

  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data.filter((c) => c.eliminado === false)),
      error: (err) => console.error('Error cargando categorías', err),
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.actualizarStock();
      },
      error: (err) => console.error('Error cargando productos', err),
    });
  }

  loadInventarios(): void {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        this.inventarios = data;
        this.actualizarStock();
      },
      error: (err) => console.error('Error cargando inventarios', err),
    });
  }

  /** ✅ Combina productos con sus inventarios + stock total */
  actualizarStock(): void {
    if (!this.productos.length || !this.inventarios.length) return;

    this.productosConStockAll = this.productos
      .map((p) => {
        const invs = this.inventarios.filter((i) => i.id_producto === p.id_producto);
        const total = invs.reduce((sum, i) => sum + (i.cantidad || 0), 0);

        return { ...p, inventarios: invs, totalStock: total };
      })
      // ✅ IMPORTANTE: solo muestra productos que realmente tienen inventarios
      .filter((p) => p.inventarios.length > 0);

    this.applyCategoriaFilter();
  }

  /** ✅ Filtra sin modificar la lista base */
  applyCategoriaFilter(): void {
    const list = [...this.productosConStockAll];

    this.productosConStock = this.selectedCategoria
      ? list.filter((p) => p.id_categoria === this.selectedCategoria)
      : list;
  }

  /** handler para (change) del select */
  onCategoriaChange(): void {
    this.applyCategoriaFilter();
  }

  // 🔹 Abrir / Cerrar modales
  openProductos() {
    this.showProductos = true;
  }

  openCategorias() {
    this.showCategorias = true;
  }

  openIngresoProducto() {
    this.showIngresoProducto = true;
  }

  closeModals() {
    this.showProductos = false;
    this.showCategorias = false;
    this.showIngresoProducto = false;
    this.loadInventarios(); // recarga inventarios para actualizar stock después de cualquier cambio
  }

  // ✅ Movimientos
  goToMovimientos(idProducto: string): void {
    this.router.navigate(['/inventory/productos/movimientos', idProducto]);
  }


}