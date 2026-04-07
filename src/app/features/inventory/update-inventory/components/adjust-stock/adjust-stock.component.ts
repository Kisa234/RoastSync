import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';

import { UiService } from '../../../../../shared/services/ui.service';
import { Molienda } from '../../../../../shared/models/molienda';
import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { AjustarStockPayload } from '../../../../../shared/models/almacen';

type InventoryEntityBackendType =
  | 'LOTE'
  | 'LOTE_TOSTADO'
  | 'PRODUCTO'
  | 'MUESTRA'
  | 'INSUMO';

interface InventoryByAlmacen {
  id_almacen: string;
  nombre: string;
  cantidad: number;
}

export interface InventorySearchRowModal {
  id: string;
  displayName: string;
  reference: string;
  tipo: 'INSUMO' | 'LOTE_VERDE' | 'LOTE_TOSTADO' | 'MUESTRA' | 'PRODUCTO';
  userId?: string;
  stockTotal: number;
  almacenes: InventoryByAlmacen[];
  raw: unknown;
}

@Component({
  selector: 'adjust-stock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './adjust-stock.component.html'
})
export class AdjustStockComponent {
  readonly X = X;
  readonly Check = Check;
  readonly moliendaOptions = Object.values(Molienda);

  @Input({ required: true }) row!: InventorySearchRowModal;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tabs: { key: string; label: string }[] = [
    { key: 'manual', label: 'Ajuste manual' }
  ];
  activeTab = 'manual';

  model: {
    id_almacen: string;
    nueva_cantidad: number | null;
    motivo: string;
    gramaje: number | null;
    molienda: Molienda | null;
  } = {
    id_almacen: '',
    nueva_cantidad: null,
    motivo: '',
    gramaje: null,
    molienda: null
  };

  loading = false;

  constructor(
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) {}

  selectTab(key: string) {
    this.activeTab = key;
  }

  onCancel() {
    this.close.emit();
  }

  get isProducto(): boolean {
    return this.row?.tipo === 'PRODUCTO';
  }

  get selectedAlmacenCantidad(): number {
    const selected = this.row?.almacenes?.find(a => a.id_almacen === this.model.id_almacen);
    return Number(selected?.cantidad ?? 0);
  }

  private mapTipoToBackend(tipo: InventorySearchRowModal['tipo']): InventoryEntityBackendType {
    switch (tipo) {
      case 'LOTE_VERDE':
        return 'LOTE';
      case 'LOTE_TOSTADO':
        return 'LOTE_TOSTADO';
      case 'PRODUCTO':
        return 'PRODUCTO';
      case 'MUESTRA':
        return 'MUESTRA';
      case 'INSUMO':
        return 'INSUMO';
    }
  }

  isButtonDisabled(): boolean {
    if (!this.model.id_almacen) return true;
    if (this.model.nueva_cantidad === null || this.model.nueva_cantidad === undefined) return true;
    if (Number(this.model.nueva_cantidad) < 0) return true;

    if (this.isProducto) {
      if (this.model.gramaje === null || this.model.gramaje === undefined || Number(this.model.gramaje) <= 0) {
        return true;
      }

      if (!this.model.molienda) {
        return true;
      }
    }

    return this.loading;
  }

  saveManual() {
    if (!this.model.id_almacen) {
      this.uiSvc.alert('warning', 'Atención', 'Debes seleccionar un almacén');
      return;
    }

    if (this.model.nueva_cantidad === null || this.model.nueva_cantidad === undefined) {
      this.uiSvc.alert('warning', 'Atención', 'La nueva cantidad es requerida');
      return;
    }

    if (Number(this.model.nueva_cantidad) < 0) {
      this.uiSvc.alert('warning', 'Atención', 'La nueva cantidad no puede ser negativa');
      return;
    }

    if (this.isProducto) {
      if (!this.model.gramaje || Number(this.model.gramaje) <= 0) {
        this.uiSvc.alert('warning', 'Atención', 'El gramaje es requerido para producto');
        return;
      }

      if (!this.model.molienda) {
        this.uiSvc.alert('warning', 'Atención', 'La molienda es requerida para producto');
        return;
      }
    }

    const payload: AjustarStockPayload = {
      entidad: this.mapTipoToBackend(this.row.tipo),
      id_entidad: this.row.id,
      id_almacen: this.model.id_almacen,
      nueva_cantidad: Number(this.model.nueva_cantidad),
      motivo: this.model.motivo?.trim() || undefined,
      gramaje: this.isProducto ? Number(this.model.gramaje) : null,
      molienda: this.isProducto ? this.model.molienda : null
    };

    this.loading = true;

    this.almacenSvc.ajustarStock(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.uiSvc.alert('success', 'Éxito', resp?.message || 'Stock ajustado correctamente');
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert(
          'error',
          'Error',
          err?.error?.error || 'No se pudo ajustar el stock'
        );
      }
    });
  }
}