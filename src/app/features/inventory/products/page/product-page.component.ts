import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Plus, FolderPlus, Eye, Edit2, LucideAngularModule } from 'lucide-angular';

import { Producto } from '../../../../shared/models/producto';
import { Categoria } from '../../../../shared/models/categoria';
import { Inventario } from '../../../../shared/models/inventario';

import { ProductoService } from '../service/producto.service';
import { CategoriaService } from '../service/categoria.service';
import { InventarioService } from '../service/inventario.service';

import { CategoriasComponent } from '../components/categorias/categorias.component';
import { ProductosComponent } from '../components/productos/productos.component';
import { IngresoProductComponent } from '../components/ingreso-product/ingreso-product.component';
import { MovimientosInventarioComponent } from '../components/movimientos-inventario/movimientos-inventario.component';

type ProductoConStock = Producto & { inventarios: Inventario[]; totalStock: number };

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
    MovimientosInventarioComponent,
  ],
})
export class ProductPageComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  inventarios: Inventario[] = [];

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

  // ✅ Modal movimientos
  showMovimientos = false;
  selectedProducto: ProductoConStock | null = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private inventarioService: InventarioService
  ) {}

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

  // ✅ Movimientos
  openMovimientos(p: ProductoConStock) {
    this.selectedProducto = p;
    this.showMovimientos = true;
  }

  closeMovimientos() {
    this.showMovimientos = false;
    this.selectedProducto = null;
  }

  // 🔹 Eventos de Productos
  onEditProducto(producto: Producto) {
    console.log('Editar producto', producto);
  }

  onDeleteProducto(producto: Producto) {
    console.log('Eliminar producto', producto);
  }

  onAddProducto() {
    console.log('Agregar nuevo producto');
  }

  // 🔹 Eventos de Categorías
  onEditCategoria(categoria: Categoria) {
    console.log('Editar categoría', categoria);
  }

  onDeleteCategoria(categoria: Categoria) {
    console.log('Eliminar categoría', categoria);
  }

  onAddCategoria() {
    console.log('Agregar nueva categoría');
  }
}