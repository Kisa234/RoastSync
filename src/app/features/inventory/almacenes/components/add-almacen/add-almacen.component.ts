import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { CreateAlmacenDto } from '../../../../../shared/models/almacen';
import { AlmacenService } from '../../service/almacen.service';
import { UiService } from '../../../../../shared/services/ui.service';


@Component({
  selector: 'add-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './add-almacen.component.html'
})
export class AddAlmacenComponent {

  // icons
  readonly X = X;
  readonly Check = Check;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  tabs: { key: string; label: string }[] = [
    { key: 'manual', label: 'Manual' },
  ];
  activeTab = 'manual';

  model: CreateAlmacenDto = {
    nombre: '',
    descripcion: '',
    activo: true,
  };

  constructor(
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) {}

  selectTab(key: string) {
    this.activeTab = key;
  }

  isButtonDisabled(): boolean {
    return !this.model.nombre?.trim();
  }

  onCancel() {
    this.close.emit();
  }

  saveManual() {
    if (this.isButtonDisabled()) {
      this.uiSvc.alert('warning', 'Atención', 'El nombre es requerido');
      return;
    }

    this.almacenSvc.createAlmacen({
      nombre: this.model.nombre.trim(),
      descripcion: this.model.descripcion?.trim() || '',
      activo: this.model.activo ?? true,
    }).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Éxito', 'Almacén creado');
        this.create.emit();
        this.close.emit();
      },
      error: () => {
        this.uiSvc.alert('error', 'Error', 'No se pudo crear el almacén');
      }
    });
  }
}
