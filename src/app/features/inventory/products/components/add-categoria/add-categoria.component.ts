import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { CategoriaService } from '../../service/categoria.service';
import { Categoria } from '../../../../shared/models/categoria';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'add-categoria',
  templateUrl: './add-categoria.component.html',
  imports:[
    FormsModule,
    CommonModule
  ]
})
export class AddCategoriaComponent {
  @Output() closes = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Categoria>();

  form: Partial<Categoria> = {
    nombre: '',
    descripcion: ''
  };

  loading = false;

  constructor(private categoriaSvc: CategoriaService) {}

  save() {
    if (!this.form.nombre?.trim()) return;
    this.loading = true;

    this.categoriaSvc.createCategoria(this.form).subscribe({
      next: (res) => {
        this.saved.emit(res);
        this.closes.emit();
      },
      error: (err) => {
        console.error('Error al crear categoría:', err);
        this.loading = false;
      }
    });
  }

  close(){
    this.closes.emit();
  }
}
