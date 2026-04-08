import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaInsumo } from '../../../../../shared/models/categoria-insumo';
import { CategoriaInsumoService } from '../../service/categoria-insumo.service';

@Component({
  selector: 'app-edit-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-categoria.component.html',
})
export class EditCategoriaComponent implements OnChanges {

  @Input() categoria!: CategoriaInsumo;
  @Output() close = new EventEmitter<void>();

  nombre = '';
  activo = true;

  saving = false;
  errorMsg = '';

  constructor(private categoriaService: CategoriaInsumoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoria'] && this.categoria) {
      this.nombre = this.categoria.nombre ?? '';
      this.activo = this.categoria.activo ?? true;
    }
  }

  onCancel() {
    this.close.emit();
  }

  save(): void {
    this.errorMsg = '';

    if (!this.categoria?.id_categoria) {
      this.errorMsg = 'Categoría inválida.';
      return;
    }

    if (!this.nombre.trim()) {
      this.errorMsg = 'El nombre es requerido.';
      return;
    }

    this.saving = true;

    this.categoriaService.update(this.categoria.id_categoria, {
      nombre: this.nombre.trim(),
      activo: this.activo
    }).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'No se pudo actualizar la categoría.';
      }
    });
  }
}