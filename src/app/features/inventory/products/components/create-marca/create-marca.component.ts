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
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Marca>();

  marcaForm: CreateMarcaForm = {
    nombre: '',
    descripcion: null,
  };

  constructor(private readonly marcaService: MarcaService) {}

  closeModal() {
    this.close.emit();
  }

  saveMarca() {
    const nombre = (this.marcaForm.nombre || '').trim();
    if (!nombre) return;

    const payload: CreateMarcaForm = {
      nombre,
      descripcion: (this.marcaForm.descripcion ?? '').toString().trim() || null,
    };

    this.marcaService.create(payload).subscribe({
      next: (marcaCreada) => {
        this.saved.emit(marcaCreada);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error al crear marca:', err);
      },
    });
  }
}