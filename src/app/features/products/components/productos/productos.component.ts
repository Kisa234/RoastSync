import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Edit, LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { Producto } from '../../../../shared/models/producto';
import { ProductoService } from '../../service/producto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaNombrePipe } from "../../../../shared/pipes/categoria-nombre.pipe";
import { AddProductComponent } from '../add-product/add-product.component';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'productos',
  templateUrl: './productos.component.html',
  imports: [
    LucideAngularModule,
    FormsModule,
    CommonModule,
    CategoriaNombrePipe,
    EditProductComponent,
    AddProductComponent
  ]
})
export class ProductosComponent implements OnInit {
  @Output() closes = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Producto>();
  @Output() delete = new EventEmitter<Producto>();

  productos: Producto[] = [];
  selectedProducto?: Producto;

  showAdd = false;
  showEdit = false;

  Edit = Edit;
  Trash2 = Trash2;
  Plus = Plus;

  constructor(
    private productoSvc: ProductoService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.loadProductos();
  }

  /** Cargar todos los productos */
  loadProductos() {
    this.productoSvc.getProductos().subscribe({
      next: (res) => {
        this.productos = (res || []).filter(p => p?.activo === true);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  /** Abrir modal agregar */
  openAddProduct() {
    this.showAdd = true;
  }

  /** Abrir modal editar */
  openEdit(producto: Producto) {
    this.selectedProducto = producto;
    this.showEdit = true;
  }

  /** Cerrar todos los modales hijos */
  closeChildModals() {
    this.showAdd = false;
    this.showEdit = false;
    this.selectedProducto = undefined;
  }

  /** Recargar productos después de guardar o editar */
  reloadProductos() {
    this.closeChildModals();
    this.loadProductos();
  }

  /** Cerrar modal principal */
  close() {
    this.closes.emit();
  }

  /** Eliminar producto */

  async openDelete(producto: Producto) {
      const ok = await this.uiSvc.confirm({
        title: 'Eliminar Producto',
        message: `¿Seguro que deseas eliminar el producto "${producto.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      });
  
      if (!ok) return;
  
      this.productoSvc.deleteProducto(producto.id_producto).subscribe({
        next: () => {
          this.uiSvc.alert(
            'success',
            'Categoría eliminada',
            `La categoría "${producto.nombre}" se eliminó correctamente.`
          );
          this.loadProductos();
        },
        error: (err) => {
          console.error('Error eliminando categoría:', err);
          this.uiSvc.alert(
            'error',
            'Error',
            'No se pudo eliminar la categoría. Inténtalo nuevamente.'
          );
        }
      });
    }
}
