import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X, Sparkles, TriangleAlert } from 'lucide-angular';

import { UiService } from '../../../../shared/services/ui.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { Lote } from '../../../../shared/models/lote';

export interface PreciosLote {
  precio_1: number | null;
  escala_2: number | null;
  escala_3: number | null;
}

@Component({
  selector: 'edit-precios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './edit-precios.component.html',
})
export class EditPreciosComponent implements OnInit {
  @Input() lote: Lote | null = null;
  @Input() isAdmin = false;
  @Input() precioSugerido = 0;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<PreciosLote>();

  readonly X = X;
  readonly Check = Check;
  readonly Sparkles = Sparkles;
  readonly TriangleAlert = TriangleAlert;

  // Copia local: la fila de la tabla no cambia hasta que se guarda con éxito
  form: PreciosLote = { precio_1: null, escala_2: null, escala_3: null };

  saving = false;

  constructor(
    private readonly loteService: LoteService,
    private readonly uiService: UiService,
  ) {}

  ngOnInit(): void {
    if (!this.lote?.id_lote) {
      this.uiService.alert('error', 'Error', 'No se recibió el lote.');
      this.onCancel();
      return;
    }

    this.form = {
      precio_1: this.toNumberOrNull(this.lote.precio_1),
      escala_2: this.toNumberOrNull(this.lote.escala_2),
      escala_3: this.toNumberOrNull(this.lote.escala_3),
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  get costo(): number {
    return Number(this.lote?.costo ?? 0) || 0;
  }

  usarSugerido(): void {
    if (!this.precioSugerido) return;
    this.form.precio_1 = this.round2(this.precioSugerido);
  }

  /** Aviso no bloqueante: algún precio queda por debajo del costo base (solo admin lo ve). */
  get preciosBajoCosto(): string[] {
    if (!this.isAdmin || !this.costo) return [];
    const bajos: string[] = [];
    const p1 = this.toNumberOrNull(this.form.precio_1);
    const e2 = this.toNumberOrNull(this.form.escala_2);
    const e3 = this.toNumberOrNull(this.form.escala_3);
    if (p1 !== null && p1 < this.costo) bajos.push('Precio 1');
    if (e2 !== null && e2 < this.costo) bajos.push('Escala 2');
    if (e3 !== null && e3 < this.costo) bajos.push('Escala 3');
    return bajos;
  }

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  validate(): boolean {
    // Todos los precios son opcionales e independientes: solo se valida lo que se llene
    const campos: [string, number | null][] = [
      ['Precio 1', this.toNumberOrNull(this.form.precio_1)],
      ['Escala 2', this.toNumberOrNull(this.form.escala_2)],
      ['Escala 3', this.toNumberOrNull(this.form.escala_3)],
    ];

    for (const [nombre, valor] of campos) {
      if (valor === null) continue;
      if (valor <= 0) {
        this.uiService.alert('warning', 'Validación', `${nombre} debe ser mayor a 0.`);
        return false;
      }
      if (this.round2(valor) !== valor) {
        this.uiService.alert('warning', 'Validación', `${nombre} admite como máximo 2 decimales.`);
        return false;
      }
    }

    return true;
  }

  // ==========================================
  // ACCIONES
  // ==========================================
  onCancel(): void {
    if (this.saving) return;
    this.close.emit();
  }

  save(): void {
    if (this.saving) return;
    if (!this.validate()) return;
    if (!this.lote?.id_lote) return;

    const payload: PreciosLote = {
      precio_1: this.toNumberOrNull(this.form.precio_1),
      escala_2: this.toNumberOrNull(this.form.escala_2),
      escala_3: this.toNumberOrNull(this.form.escala_3),
    };

    this.saving = true;

    this.loteService.update(this.lote.id_lote, payload as any).subscribe({
      next: () => {
        this.saving = false;
        this.uiService.alert('success', 'Precios actualizados', `Se guardaron los precios del lote ${this.lote!.id_lote}.`);
        this.saved.emit(payload);
      },
      error: (error) => {
        this.saving = false;

        const backendMessage =
          error?.error?.error ||
          error?.error?.message ||
          'No se pudieron guardar los precios.';

        this.uiService.alert('error', 'Error', backendMessage);
      }
    });
  }
}