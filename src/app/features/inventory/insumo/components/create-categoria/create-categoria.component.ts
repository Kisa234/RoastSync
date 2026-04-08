import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaInsumoService } from '../../service/categoria-insumo.service';

@Component({
  selector: 'app-create-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-categoria.component.html',
})
export class CreateCategoriaComponent {

  @Output() close = new EventEmitter<void>();

  nombre = '';
  activo = true;

  saving = false;
  errorMsg = '';

  constructor(private categoriaService: CategoriaInsumoService) {}

  onCancel() {
    this.close.emit();
  }

  save() {
    this.errorMsg = '';

    if (!this.nombre.trim()) {
      this.errorMsg = 'El nombre es requerido.';
      return;
    }

    this.saving = true;

    this.categoriaService.create({
      nombre: this.nombre.trim(),
      activo: this.activo
    }).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'No se pudo crear la categoría.';
      }
    });
  }
}