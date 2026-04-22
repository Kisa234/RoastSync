import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { X, LucideAngularModule } from 'lucide-angular';
import { RolService } from '../../service/rol-service.service';

@Component({
  selector: 'create-role',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './create-rol.component.html',
})
export class CreateRolComponent {
  @Output() close = new EventEmitter<{ created: boolean; rolId?: string }>();

  X = X;

  nombre = '';
  descripcion = '';
  loading = false;
  errorMsg = '';

  constructor(private rolService: RolService) {}

  save() {
    const nombre = this.nombre.trim();
    if (!nombre) return;

    this.loading = true;
    this.errorMsg = '';

    this.rolService.create({ nombre, descripcion: this.descripcion?.trim() || undefined }).subscribe({
      next: (rol: any) => {
        // asumo que el backend devuelve el rol creado con id_rol
        this.loading = false;
        this.close.emit({ created: true, rolId: rol?.id_rol });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo crear el rol';
      }
    });
  }

  cancel() {
    this.close.emit({ created: false });
  }
}
