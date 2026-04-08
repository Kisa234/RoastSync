import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check, ArrowRightLeft } from 'lucide-angular';

import { UiService } from '../../../../../shared/services/ui.service';
import { Molienda } from '../../../../../shared/models/molienda';
import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { TrasladarStockPayload } from '../../../../../shared/models/almacen';

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
  selector: 'transfer-stock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './transfer-stock.component.html'
})
export class TransferStockComponent implements OnInit {
  readonly X = X;
  readonly Check = Check;
  readonly ArrowRightLeft = ArrowRightLeft;
  readonly moliendaOptions = Object.values(Molienda);
  almacenesActivos: { id_almacen: string; nombre: string }[] = [];

  @Input({ required: true }) row!: InventorySearchRowModal;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tabs: { key: string; label: string }[] = [
    { key: 'manual', label: 'Traslado manual' }
  ];
  activeTab = 'manual';

  model: {
    id_almacen_origen: string;
    id_almacen_destino: string;
    cantidad: number | null;
    motivo: string;
    gramaje: number | null;
    molienda: Molienda | null;
  } = {
      id_almacen_origen: '',
      id_almacen_destino: '',
      cantidad: null,
      motivo: '',
      gramaje: null,
      molienda: null
    };

  loading = false;

  constructor(
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) { }


  ngOnInit(): void {
    this.almacenSvc.getAlmacenesActivos().subscribe({
      next: (almacenes) => {
        this.almacenesActivos = almacenes;
      },
      error: () => {
        this.uiSvc.alert('error', 'Error', 'No se pudieron cargar los almacenes');
      }
    });
  }
  selectTab(key: string) {
    this.activeTab = key;
  }

  onCancel() {
    this.close.emit();
  }

  get isProducto(): boolean {
    return this.row?.tipo === 'PRODUCTO';
  }

  get selectedOrigenCantidad(): number {
    const origen = this.row?.almacenes?.find(a => a.id_almacen === this.model.id_almacen_origen);
    return Number(origen?.cantidad ?? 0);
  }

  get almacenesDestino() {
    return (this.almacenesActivos ?? []).filter(a => a.id_almacen !== this.model.id_almacen_origen);
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
    if (!this.model.id_almacen_origen) return true;
    if (!this.model.id_almacen_destino) return true;
    if (this.model.id_almacen_origen === this.model.id_almacen_destino) return true;
    if (this.model.cantidad === null || this.model.cantidad === undefined) return true;
    if (Number(this.model.cantidad) <= 0) return true;
    if (Number(this.model.cantidad) > this.selectedOrigenCantidad) return true;

    // if (this.isProducto) {
    //   if (this.model.gramaje === null || this.model.gramaje === undefined || Number(this.model.gramaje) <= 0) {
    //     return true;
    //   }

    //   if (!this.model.molienda) {
    //     return true;
    //   }
    // }

    return this.loading;
  }

  saveManual() {
    if (!this.model.id_almacen_origen) {
      this.uiSvc.alert('warning', 'Atención', 'Debes seleccionar el almacén origen');
      return;
    }

    if (!this.model.id_almacen_destino) {
      this.uiSvc.alert('warning', 'Atención', 'Debes seleccionar el almacén destino');
      return;
    }

    if (this.model.id_almacen_origen === this.model.id_almacen_destino) {
      this.uiSvc.alert('warning', 'Atención', 'El almacén origen y destino no pueden ser iguales');
      return;
    }

    if (this.model.cantidad === null || this.model.cantidad === undefined || Number(this.model.cantidad) <= 0) {
      this.uiSvc.alert('warning', 'Atención', 'La cantidad debe ser mayor a 0');
      return;
    }

    if (Number(this.model.cantidad) > this.selectedOrigenCantidad) {
      this.uiSvc.alert('warning', 'Atención', 'La cantidad supera el stock disponible en el almacén origen');
      return;
    }

    // if (this.isProducto) {
    //   if (!this.model.gramaje || Number(this.model.gramaje) <= 0) {
    //     this.uiSvc.alert('warning', 'Atención', 'El gramaje es requerido para producto');
    //     return;
    //   }

    //   if (!this.model.molienda) {
    //     this.uiSvc.alert('warning', 'Atención', 'La molienda es requerida para producto');
    //     return;
    //   }
    // }

    const payload: TrasladarStockPayload = {
      entidad: this.mapTipoToBackend(this.row.tipo),
      id_entidad: this.row.id,
      id_almacen_origen: this.model.id_almacen_origen,
      id_almacen_destino: this.model.id_almacen_destino,
      cantidad: Number(this.model.cantidad),
      motivo: this.model.motivo?.trim() || undefined,
      // gramaje: this.isProducto ? Number(this.model.gramaje) : null,
      // molienda: this.isProducto ? this.model.molienda : null
    };

    console.log('Payload para traslado de stock:', payload);

    this.loading = true;

    this.almacenSvc.trasladarStock(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.uiSvc.alert('success', 'Éxito', resp?.message || 'Stock trasladado correctamente');
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert(
          'error',
          'Error',
          err?.error?.error || 'No se pudo trasladar el stock'
        );
      }
    });
  }
}