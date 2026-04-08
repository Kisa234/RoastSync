import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaInsumo } from '../../../../../shared/models/categoria-insumo';
import { InsumoService } from '../../service/insumo.service';

@Component({
  selector: 'app-create-insumo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-insumo.component.html',
})
export class CreateInsumoComponent {

  @Input() categorias: CategoriaInsumo[] = [];
  @Output() close = new EventEmitter<void>();

  nombre = '';
  id_categoria = '';
  unidad_medida = '';
  descripcion = '';
  activo = true;

  unidadesMedida: string[] = [
    'unidad',
    'paquete',
    'caja',
    'bolsa',
    'rollo',
    'kg',
    'g',
    'lt',
    'ml'
  ];


  saving = false;
  errorMsg = '';

  constructor(private insumoService: InsumoService) { }

  onCancel() {
    this.close.emit();
  }

  save(): void {
    this.errorMsg = '';

    if (!this.nombre.trim()) {
      this.errorMsg = 'El nombre es requerido.';
      return;
    }

    if (!this.id_categoria) {
      this.errorMsg = 'Selecciona una categoría.';
      return;
    }

    if (!this.unidad_medida.trim()) {
      this.errorMsg = 'La unidad de medida es requerida.';
      return;
    }

    this.saving = true;

    this.insumoService.create({
      nombre: this.nombre.trim(),
      id_categoria: this.id_categoria,
      unidad_medida: this.unidad_medida.trim(),
      descripcion: this.descripcion?.trim() || undefined,
      activo: this.activo
    }).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'No se pudo crear el insumo.';
      }
    });
  }
}