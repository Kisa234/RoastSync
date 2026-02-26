import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { MarcaService } from '../../service/marca.service';

import { Producto } from '../../../../../shared/models/producto';
import { Categoria } from '../../../../../shared/models/categoria';
import { Marca } from '../../../../../shared/models/marca';
import { CreateMarcaComponent } from "../create-marca/create-marca.component";

@Component({
  selector: 'add-product',
  templateUrl: './add-product.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateMarcaComponent],
})
export class AddProductComponent implements OnInit {
  @Output() closes = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Producto>();

  form: Partial<Producto> = {
    nombre: '',
    descripcion: null,

    id_categoria: '',
    id_marca: null,

    modelo: null,
    color: null,

    peso_kg: null,
    largo_cm: null,
    ancho_cm: null,
    alto_cm: null,
    volumen_cm3: null,
    material: null,
    fragil: null,

    es_combo: false,
    activo: true,
  };

  categorias: Categoria[] = [];
  marcas: Marca[] = [];

  loading = false;

  // modal marca
  showAddMarca = false;
  marcaForm: { nombre: string; descripcion?: string | null } = {
    nombre: '',
    descripcion: null,
  };

  constructor(
    private productoSvc: ProductoService,
    private catSvc: CategoriaService,
    private marcaSvc: MarcaService
  ) {}

  ngOnInit() {
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
    this.marcaForm = { nombre: '', descripcion: null };
    this.showAddMarca = true;
  }


  saveMarca() {
    if (!this.marcaForm.nombre?.trim()) return;

    this.marcaSvc.create({
      nombre: this.marcaForm.nombre.trim(),
      descripcion: this.marcaForm.descripcion ?? null,
    }).subscribe({
      next: (created) => {
        // agrega a la lista y selecciona
        this.marcas = [created, ...this.marcas];
        this.form.id_marca = created.id_marca;
        this.showAddMarca = false;
      },
      error: (err) => {
        console.error('Error al crear marca:', err);
      },
    });
  }

  // Producto
  save() {
    if (!this.form.nombre?.trim()) return;

    // normaliza strings vacíos a null
    this.form.nombre = this.form.nombre.trim();
    this.form.descripcion = this.form.descripcion?.toString()?.trim() || null;
    this.form.modelo = this.form.modelo?.toString()?.trim() || null;
    this.form.color = this.form.color?.toString()?.trim() || null;
    this.form.material = this.form.material?.toString()?.trim() || null;

    this.loading = true;

    this.productoSvc.createProducto(this.form).subscribe({
      next: (res) => {
        this.saved.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  closeModal() {
    this.showAddMarca = false;
    this.loadMarcas(); // recarga marcas para mostrar la nueva
  }

  close() {
    this.closes.emit();
  }
}