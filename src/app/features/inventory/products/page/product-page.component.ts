import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../../shared/models/producto';
import { Categoria } from '../../../../shared/models/categoria';
import { Inventario } from '../../../../shared/models/inventario';
import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { InventarioService } from '../../service/inventario.service';

import { Plus, FolderPlus, Eye, Edit2, LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoNombrePipe } from "../../../../shared/pipes/product-name.pipe";
import { ProductosComponent } from "../../components/productos/productos.component";
import { CategoriasComponent } from "../../components/categorias/categorias.component";

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  imports: [
    LucideAngularModule,
    CommonModule,
    FormsModule,
    ProductoNombrePipe,
    ProductosComponent,
    CategoriasComponent
  ]
})
export class ProductPageComponent implements OnInit {
  productos: Producto[] = [];
  productosConStock: (Producto & { totalStock: number })[] = [];
  categorias: Categoria[] = [];
  inventarios: Inventario[] = [];

  selectedCategoria: string = '';

  Plus = Plus;
  FolderPlus = FolderPlus;
  Eye = Eye;
  Edit2 = Edit2;

  showProductos = false;
  showCategorias = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
    this.loadInventarios();
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data.filter(c => c.eliminado === false)),
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

  /** Combina productos con su stock total */
  actualizarStock(): void {
    if (!this.productos.length || !this.inventarios.length) return;

    this.productosConStock = this.productos.map((p) => {
      const invs = this.inventarios.filter((i) => i.id_producto === p.id_producto);
      const total = invs.reduce((sum, i) => sum + (i.cantidad || 0), 0);
      return { ...p, inventarios: invs, totalStock: total };
    });

    this.filterByCategoria();
  }

  /** Filtra productos por categoría */
  filterByCategoria(): void {
    if (this.selectedCategoria) {
      this.productosConStock = this.productosConStock.filter(
        (p) => p.id_categoria === this.selectedCategoria
      );
    } else {
      this.actualizarStock();
    }
  }

  // 🔹 Abrir / Cerrar modales
  openProductos() {
    this.showProductos = true;
  }

  closeProductos() {
    this.showProductos = false;
  }

  openCategorias() {
    this.showCategorias = true;
  }

  closeCategorias() {
    this.showCategorias = false;
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
