import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { UpdateAlmacenDto } from '../../../../../shared/models/almacen';
import { AlmacenService } from '../../service/almacen.service';
import { UiService } from '../../../../../shared/services/ui.service';


@Component({
  selector: 'edit-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './edit-almacen.component.html'
})
export class EditAlmacenComponent {

  // icons
  readonly X = X;
  readonly Check = Check;

  @Input() almacenId = '';
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  // tabs
  tabs: { key: string; label: string }[] = [
    { key: 'manual', label: 'Manual' },
  ];
  activeTab = 'manual';

  loading = false;

  model: UpdateAlmacenDto = {
    nombre: '',
    descripcion: '',
    activo: true,
  };

  constructor(
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) {}

  ngOnInit() {
    if (!this.almacenId) return;

    this.loading = true;
    this.almacenSvc.getAlmacenById(this.almacenId).subscribe({
      next: (a) => {
        this.model = {
          nombre: a.nombre ?? '',
          descripcion: a.descripcion ?? '',
          activo: a.activo !== false,
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', 'No se pudo cargar el almacén');
      }
    });
  }

  selectTab(key: string) {
    this.activeTab = key;
  }

  isButtonDisabled(): boolean {
    return !this.model.nombre?.trim();
  }

  onCancel() {
    this.close.emit();
  }

  save() {
    if (!this.almacenId) return;

    if (this.isButtonDisabled()) {
      this.uiSvc.alert('warning', 'Atención', 'El nombre es requerido');
      return;
    }

    const payload: UpdateAlmacenDto = {
      nombre: this.model.nombre?.trim(),
      descripcion: this.model.descripcion?.trim() || '',
      activo: this.model.activo ?? true,
    };

    this.almacenSvc.updateAlmacen(this.almacenId, payload).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Éxito', 'Almacén actualizado');
        this.create.emit();
        this.close.emit();
      },
      error: () => {
        this.uiSvc.alert('error', 'Error', 'No se pudo actualizar el almacén');
      }
    });
  }
}
