import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarcaService } from '../../service/marca.service';
import { Marca } from '../../../../../shared/models/marca';

export interface CreateMarcaForm {
  nombre: string;
  descripcion?: string | null;
}

@Component({
  selector: 'create-marca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-marca.component.html',
})
export class CreateMarcaComponent {
  @Input() showAddMarca: boolean = false;
  @Input() savingMarca: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Marca>();

  marcaForm: CreateMarcaForm = {
    nombre: '',
    descripcion: null,
  };

  constructor(private readonly marcaService: MarcaService) {}

  cancelAddMarca() {
    this.resetForm();
    this.close.emit();
  }

  saveMarca() {
    const nombre = (this.marcaForm.nombre || '').trim();
    if (!nombre || this.savingMarca) return;

    const payload: CreateMarcaForm = {
      nombre,
      descripcion: (this.marcaForm.descripcion ?? '').toString().trim() || null,
    };

    // Si quieres que el loading sea 100% interno, elimina el @Input savingMarca
    this.marcaService.create(payload).subscribe({
      next: (marcaCreada) => {
        this.saved.emit(marcaCreada);
        this.resetForm();
        this.close.emit();
      },
      error: (err) => {
        console.error('Error al crear marca:', err);
      },
    });
  }

  private resetForm() {
    this.marcaForm = { nombre: '', descripcion: null };
  }
}