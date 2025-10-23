import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Edit, LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { Producto } from '../../../../shared/models/producto';
import { ProductoService } from '../../service/producto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaNombrePipe } from "../../../../shared/pipes/categoria-nombre.pipe";

@Component({
  selector: 'productos',
  templateUrl: './productos.component.html',
  imports: [
    LucideAngularModule,
    FormsModule,
    CommonModule,
    CategoriaNombrePipe
]
})
export class ProductosComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Producto>();
  @Output() delete = new EventEmitter<Producto>();

  productos: Producto[] = [];

  Edit = Edit;
  Trash2 = Trash2;
  Plus = Plus;

  constructor(private productoSvc: ProductoService) { }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos() {
    this.productoSvc.getProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  close() {
    this.closeModal.emit();
  }

  openAddProduct() {
    this.add.emit();
  }

  openEdit(product: Producto) {
    this.edit.emit(product);
  }

  openDelete(product: Producto) {
    this.delete.emit(product);
  }
}
