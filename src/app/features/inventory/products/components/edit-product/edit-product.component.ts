import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { MarcaService } from '../../service/marca.service';

import { Producto } from '../../../../../shared/models/producto';
import { Categoria } from '../../../../../shared/models/categoria';
import { Marca } from '../../../../../shared/models/marca';

import { CreateMarcaComponent, CreateMarcaForm } from '../create-marca/create-marca.component';

@Component({
  selector: 'edit-product',
  templateUrl: './edit-product.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateMarcaComponent],
})
export class EditProductComponent implements OnInit {
  @Input() producto!: Producto;

  @Output() closes = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Producto>();

  form: Partial<Producto> = {};
  loading = false;

  categorias: Categoria[] = [];
  marcas: Marca[] = [];

  // modal marca
  showAddMarca = false;

  constructor(
    private readonly productoSvc: ProductoService,
    private readonly catSvc: CategoriaService,
    private readonly marcaSvc: MarcaService
  ) {}

  ngOnInit(): void {
    // clona el producto al form
    this.form = { ...this.producto };

    // por si vienen undefined
    this.form.descripcion = this.form.descripcion ?? null;
    this.form.id_marca = this.form.id_marca ?? null;

    this.loadCategorias();
    this.loadMarcas();
  }

  loadCategorias() {
    this.catSvc.getCategorias().subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  loadMarcas() {
    this.marcaSvc.getAll().subscribe({
      next: (res) => (this.marcas = res),
      error: (err) => console.error('Error al cargar marcas:', err),
    });
  }

  // Marca modal
  openAddMarca() {
    this.showAddMarca = true;
  }

  closeModal() {
    this.showAddMarca = false;
    this.loadMarcas(); // refresca lista
  }

  onMarcaCreated(payload: CreateMarcaForm) {
    // Si tu create-marca ya crea en backend y emite el form,
    // acá refrescamos marcas y cerramos. Si quieres auto-seleccionar,
    // lo mejor es que create-marca emita la "marca creada" completa.
    this.closeModal();

    // Mejor esfuerzo: recargamos y dejamos el usuario seleccionar
    // (o si tu servicio devuelve creada, pásala por output).
  }

  update() {
    if (!this.form.nombre?.trim()) return;

    // normaliza strings vacíos a null
    this.form.nombre = this.form.nombre.trim();
    this.form.descripcion = this.form.descripcion?.toString()?.trim() || null;
    this.form.modelo = this.form.modelo?.toString()?.trim() || null;
    this.form.color = this.form.color?.toString()?.trim() || null;
    this.form.material = this.form.material?.toString()?.trim() || null;

    this.loading = true;

    this.productoSvc.updateProducto(this.producto.id_producto, this.form).subscribe({
      next: (res) => {
        this.updated.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  close() {
    this.closes.emit();
  }
}