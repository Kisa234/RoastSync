import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProductoService } from '../../service/producto.service';
import { Producto } from '../../../../shared/models/producto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../service/categoria.service';
import { Categoria } from '../../../../shared/models/categoria';

@Component({
  selector: 'add-product',
  templateUrl: './add-product.component.html',
  imports: [CommonModule, FormsModule]
})
export class AddProductComponent implements OnInit {
  @Output() closes = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Producto>();

  form: Partial<Producto> = {
    nombre: '',
    descripcion: '',
    id_categoria: '',
    es_combo: false,
    activo: true
  };

  categorias: Categoria[] = [];

  loading = false;

  constructor(
    private productoSvc: ProductoService,
    private catSvc: CategoriaService
  ) {}

  ngOnInit() {
    this.catSvc.getCategorias().subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  save() {
    if (!this.form.nombre?.trim()) return;
    this.loading = true;

    this.productoSvc.createProducto(this.form).subscribe({
      next: (res) => {
        this.saved.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.loading = false;
      }
    });
  }

  close() {
    this.closes.emit();
  }
}
