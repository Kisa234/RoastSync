import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { InventorySearchRow, mapTipoToEntidadInventario, labelTipo } from '../../../../../shared/models/inventory-search-row';
import { TrasladarStockPayload } from '../../../../../shared/models/almacen';
import { Almacen } from '../../../../../shared/models/almacen';

@Component({
  selector: 'app-trasladar-stock-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UserNamePipe],
  templateUrl: './trasladar-stock.page.html'
})
export class TrasladarStockPage implements OnInit {
  readonly Check = Check;
  readonly labelTipo = labelTipo;

  row: InventorySearchRow | null = null;
  almacenesActivos: Almacen[] = [];
  saving = false;

  model = {
    id_almacen_origen: '',
    id_almacen_destino: '',
    cantidad: null as number | null,
    motivo: '',
  };

  constructor(
    private router: Router,
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) { }

  ngOnInit(): void {
    const state = history.state as { row?: InventorySearchRow };
    if (!state?.row) {
      this.uiSvc.alert('warning', 'Sesión perdida', 'Selecciona la entidad de nuevo desde el listado.');
      this.router.navigate(['/inventory/actualizar']);
      return;
    }
    this.row = state.row;

    this.almacenSvc.getAlmacenesActivos().subscribe(almacenes => this.almacenesActivos = almacenes);
  }

  get selectedOrigenCantidad(): number {
    const origen = this.row?.almacenes.find(a => a.id_almacen === this.model.id_almacen_origen);
    return Number(origen?.cantidad ?? 0);
  }

  get almacenesDestino(): Almacen[] {
    return this.almacenesActivos.filter(a => a.id_almacen !== this.model.id_almacen_origen);
  }

  canSave(): boolean {
    if (!this.model.id_almacen_origen || !this.model.id_almacen_destino) return false;
    if (this.model.id_almacen_origen === this.model.id_almacen_destino) return false;
    if (this.model.cantidad === null || Number(this.model.cantidad) <= 0) return false;
    if (Number(this.model.cantidad) > this.selectedOrigenCantidad) return false;
    return !this.saving;
  }

  onCancel(): void {
    this.router.navigate(['/inventory/actualizar']);
  }

  onSave(): void {
    if (!this.row || !this.canSave()) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Completa origen, destino y una cantidad válida.');
      return;
    }

    const payload: TrasladarStockPayload = {
      entidad: mapTipoToEntidadInventario(this.row.tipo),
      id_entidad: this.row.id,
      id_almacen_origen: this.model.id_almacen_origen,
      id_almacen_destino: this.model.id_almacen_destino,
      cantidad: Number(this.model.cantidad),
      motivo: this.model.motivo.trim() || undefined,
    };

    this.saving = true;
    this.almacenSvc.trasladarStock(payload).subscribe({
      next: (resp) => {
        this.saving = false;
        this.uiSvc.alert('success', 'Éxito', resp?.message || 'Stock trasladado correctamente');
        this.router.navigate(['/inventory/actualizar']);
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo trasladar el stock');
      }
    });
  }
}