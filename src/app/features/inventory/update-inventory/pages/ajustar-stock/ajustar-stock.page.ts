import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { InventorySearchRow, mapTipoToEntidadInventario, labelTipo } from '../../../../../shared/models/inventory-search-row';
import { AjustarStockPayload } from '../../../../../shared/models/almacen';

@Component({
  selector: 'app-ajustar-stock-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UserNamePipe],
  templateUrl: './ajustar-stock.page.html'
})
export class AjustarStockPage implements OnInit {
  readonly Check = Check;
  readonly labelTipo = labelTipo;

  row: InventorySearchRow | null = null;
  saving = false;

  model = {
    id_almacen: '',
    nueva_cantidad: null as number | null,
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
  }

  get selectedAlmacenCantidad(): number {
    const selected = this.row?.almacenes.find(a => a.id_almacen === this.model.id_almacen);
    return Number(selected?.cantidad ?? 0);
  }

  canSave(): boolean {
    if (!this.model.id_almacen) return false;
    if (this.model.nueva_cantidad === null || this.model.nueva_cantidad === undefined) return false;
    if (Number(this.model.nueva_cantidad) < 0) return false;
    return !this.saving;
  }

  onCancel(): void {
    this.router.navigate(['/inventory/actualizar']);
  }

  onSave(): void {
    if (!this.row || !this.canSave()) {
      this.uiSvc.alert('warning', 'Campos incompletos', 'Selecciona almacén e ingresa una cantidad válida.');
      return;
    }

    const payload: AjustarStockPayload = {
      entidad: mapTipoToEntidadInventario(this.row.tipo),
      id_entidad: this.row.id,
      id_almacen: this.model.id_almacen,
      nueva_cantidad: Number(this.model.nueva_cantidad),
      motivo: this.model.motivo.trim() || undefined,
    };

    this.saving = true;
    this.almacenSvc.ajustarStock(payload).subscribe({
      next: (resp) => {
        this.saving = false;
        this.uiSvc.alert('success', 'Éxito', resp?.message || 'Stock ajustado correctamente');
        this.router.navigate(['/inventory/actualizar']);
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo ajustar el stock');
      }
    });
  }
}