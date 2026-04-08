import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Check, Plus, Trash2, X, Warehouse } from 'lucide-angular';

import { UiService } from '../../../../../shared/services/ui.service';
import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { InventarioMuestraService } from '../../service/inventario-muestra.service';
import { MuestraService } from '../../service/muestra.service';

import { Almacen } from '../../../../../shared/models/almacen';

interface InventoryRow {
  id_almacen: string;
  cantidad_kg: number | null;
}

@Component({
  selector: 'add-inventory-muestra',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './add-inventory-muestra.component.html',
})
export class AddInventoryMuestraComponent implements OnInit {
  @Input() muestraId: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  readonly X = X;
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Warehouse = Warehouse;

  muestra: any = null;
  almacenes: Almacen[] = [];

  loading = false;
  loadingAlmacenes = false;
  saving = false;

  rows: InventoryRow[] = [
    {
      id_almacen: '',
      cantidad_kg: null,
    }
  ];

  constructor(
    private readonly muestraService: MuestraService,
    private readonly almacenService: AlmacenService,
    private readonly inventarioMuestraService: InventarioMuestraService,
    private readonly uiService: UiService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    if (!this.muestraId) {
      this.uiService.alert('error', 'Error', 'No se recibió la muestra.');
      this.onCancel();
      return;
    }

    this.loading = true;
    this.loadingAlmacenes = true;

    forkJoin({
      muestras: this.muestraService.getMuestrasConInventario(),
      almacenes: this.almacenService.getAlmacenesActivos(),
    }).subscribe({
      next: ({ muestras, almacenes }) => {
        this.muestra = (muestras ?? []).find((m: any) => m.id_muestra === this.muestraId) || null;
        this.almacenes = almacenes ?? [];
        this.loading = false;
        this.loadingAlmacenes = false;

        if (!this.muestra) {
          this.uiService.alert('error', 'Error', 'No se encontró la muestra.');
          this.onCancel();
        }
      },
      error: () => {
        this.loading = false;
        this.loadingAlmacenes = false;
        this.uiService.alert('error', 'Error', 'No se pudo cargar la información.');
        this.onCancel();
      }
    });
  }

  private resetForm(): void {
    this.rows = [
      {
        id_almacen: '',
        cantidad_kg: null,
      }
    ];
  }

  onCancel(): void {
    if (this.saving) return;
    this.resetForm();
    this.close.emit();
  }

  addRow(): void {
    this.rows.push({
      id_almacen: '',
      cantidad_kg: null,
    });
  }

  removeRow(index: number): void {
    if (this.rows.length === 1) {
      this.rows[0] = {
        id_almacen: '',
        cantidad_kg: null,
      };
      return;
    }

    this.rows.splice(index, 1);
  }

  getCantidadTotalMuestra(): number {
    return Number(this.muestra?.peso ?? 0) || 0;
  }

  getCantidadAsignada(): number {
    return this.rows.reduce((acc, row) => acc + (Number(row.cantidad_kg) || 0), 0);
  }

  getCantidadRestante(): number {
    return this.getCantidadTotalMuestra() - this.getCantidadAsignada();
  }

  getIdsAlmacenesExistentes(): string[] {
    return (this.muestra?.inventarioMuestras ?? []).map((i: any) => i.id_almacen);
  }

  isAlmacenYaUsado(id_almacen: string, currentIndex: number): boolean {
    if (!id_almacen) return false;

    const usadoEnFilas = this.rows.some((row, index) => {
      if (index === currentIndex) return false;
      return row.id_almacen === id_almacen;
    });

    const usadoEnBD = this.getIdsAlmacenesExistentes().includes(id_almacen);

    return usadoEnFilas || usadoEnBD;
  }

  getAlmacenesDisponibles(index: number): Almacen[] {
    const idsExistentes = this.getIdsAlmacenesExistentes();

    return this.almacenes.filter(a => {
      const usadoEnOtraFila = this.rows.some((row, i) => i !== index && row.id_almacen === a.id_almacen);
      const usadoEnBD = idsExistentes.includes(a.id_almacen);
      return !usadoEnOtraFila && !usadoEnBD;
    });
  }

  validate(): boolean {
    if (!this.muestra?.id_muestra) {
      this.uiService.alert('error', 'Error', 'No se encontró la muestra.');
      return false;
    }

    if (!this.rows.length) {
      this.uiService.alert('warning', 'Validación', 'Debes agregar al menos un inventario.');
      return false;
    }

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];

      if (!row.id_almacen) {
        this.uiService.alert('warning', 'Validación', `Selecciona un almacén en la fila ${i + 1}.`);
        return false;
      }

      if (row.cantidad_kg === null || row.cantidad_kg === undefined || Number(row.cantidad_kg) < 0) {
        this.uiService.alert('warning', 'Validación', `La cantidad de la fila ${i + 1} debe ser mayor o igual a 0.`);
        return false;
      }

      if (this.isAlmacenYaUsado(row.id_almacen, i)) {
        this.uiService.alert('warning', 'Validación', `El almacén de la fila ${i + 1} ya fue asignado.`);
        return false;
      }
    }

    const totalMuestra = this.getCantidadTotalMuestra();
    const totalAsignado = this.getCantidadAsignada();

    if (totalAsignado !== totalMuestra) {
      this.uiService.alert(
        'warning',
        'Cantidad incorrecta',
        `La suma asignada (${totalAsignado}) debe ser igual al total de la muestra (${totalMuestra}).`
      );
      return false;
    }

    return true;
  }

  save(): void {
    if (this.saving) return;
    if (!this.validate()) return;
    if (!this.muestra?.id_muestra) return;

    this.saving = true;

    const requests = this.rows.map(row =>
      this.inventarioMuestraService.create({
        id_muestra: this.muestra!.id_muestra,
        id_almacen: row.id_almacen,
        peso: Number(row.cantidad_kg),
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;
        this.uiService.alert('success', 'Inventario asignado', 'El inventario de la muestra fue asignado correctamente.');
        this.create.emit();
      },
      error: (error) => {
        this.saving = false;

        const backendMessage =
          error?.error?.error ||
          error?.error?.message ||
          'No se pudo asignar el inventario de la muestra.';

        this.uiService.alert('error', 'Error', backendMessage);
      }
    });
  }
}