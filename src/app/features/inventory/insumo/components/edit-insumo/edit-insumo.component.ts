import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Insumo } from '../../../../../shared/models/insumo';
import { CategoriaInsumo } from '../../../../../shared/models/categoria-insumo';
import { InsumoService } from '../../service/insumo.service';

@Component({
  selector: 'app-edit-insumo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-insumo.component.html',
})
export class EditInsumoComponent implements OnChanges {

  @Input() insumo!: Insumo;
  @Input() categorias: CategoriaInsumo[] = [];
  @Output() close = new EventEmitter<void>();

  nombre = '';
  id_categoria = '';
  unidad_medida = '';
  unidadCustom = '';
  descripcion = '';
  activo = true;

  unidadesMedida: string[] = [
    'unidad', 'paquete', 'caja', 'bolsa', 'rollo', 'kg', 'g', 'lt', 'ml'
  ];

  saving = false;
  errorMsg = '';

  constructor(private insumoService: InsumoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['insumo'] && this.insumo) {
      this.nombre = this.insumo.nombre ?? '';
      this.id_categoria = this.insumo.id_categoria ?? '';
      this.descripcion = this.insumo.descripcion ?? '';
      this.activo = this.insumo.activo ?? true;

      // unidad: si no está en lista, lo mando a custom
      const u = (this.insumo.unidad_medida ?? '').trim();
      const exists = this.unidadesMedida.includes(u);
      this.unidad_medida = exists ? u : '__OTRA__';
      this.unidadCustom = exists ? '' : u;
    }
  }

  onCancel() {
    this.close.emit();
  }

  save(): void {
    this.errorMsg = '';

    if (!this.insumo?.id_insumo) {
      this.errorMsg = 'Insumo inválido.';
      return;
    }

    if (!this.nombre.trim()) {
      this.errorMsg = 'El nombre es requerido.';
      return;
    }

    if (!this.id_categoria) {
      this.errorMsg = 'Selecciona una categoría.';
      return;
    }

    const unidadFinal =
      this.unidad_medida === '__OTRA__'
        ? this.unidadCustom.trim()
        : this.unidad_medida.trim();

    if (!unidadFinal) {
      this.errorMsg = 'La unidad de medida es requerida.';
      return;
    }

    this.saving = true;

    this.insumoService.update(this.insumo.id_insumo, {
      nombre: this.nombre.trim(),
      id_categoria: this.id_categoria,
      unidad_medida: unidadFinal,
      descripcion: this.descripcion?.trim() || undefined,
      activo: this.activo
    }).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'No se pudo actualizar el insumo.';
      }
    });
  }
}