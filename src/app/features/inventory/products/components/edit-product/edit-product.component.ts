import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoService } from '../../service/producto.service';
import { Producto } from '../../../../shared/models/producto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'edit-product',
  templateUrl: './edit-product.component.html',
  imports: [CommonModule, FormsModule]
})
export class EditProductComponent {
  @Input() producto!: Producto;
  @Output() closes = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Producto>();

  form: Partial<Producto> = {};
  loading = false;

  constructor(
    private productoSvc: ProductoService,
  ) {}

  ngOnInit() {
    this.form = { ...this.producto };
  }

  update() {
    if (!this.form.nombre?.trim()) return;
    this.loading = true;

    this.productoSvc.updateProducto(this.producto.id_producto, this.form).subscribe({
      next: (res) => {
        this.updated.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.loading = false;
      }
    });
  }

  close() {
    this.closes.emit();
  }
}
