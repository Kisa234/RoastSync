import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { Historial } from '../../../../../shared/models/historial';
import { Lote } from '../../../../../shared/models/lote';
import { UserNamePipe } from "../../../../../shared/pipes/user-name-pipe.pipe";

@Component({
  selector: 'ver-cambios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UserNamePipe
  ],
  templateUrl: './ver-cambios.component.html',
})
export class VerCambiosComponent implements OnInit {
  readonly X = X;

  @Input() historial!: Historial;
  @Output() close = new EventEmitter<void>();

  antes: Lote = this.emptyLote();
  despues: Lote = this.emptyLote();

  ngOnInit(): void {
    console.log('objeto_antes raw:', this.historial?.objeto_antes);
    console.log('objeto_despues raw:', this.historial?.objeto_despues);

    this.antes = this.normalize(this.historial?.objeto_antes);
    this.despues = this.normalize(this.historial?.objeto_despues);

    console.log('antes normalizado:', this.antes);
    console.log('despues normalizado:', this.despues);
  }

  onCancel() {
    this.close.emit();
  }

  emptyLote(): Lote {
    return {
      productor: '',
      finca: '',
      distrito: '',
      departamento: '',
      peso: 0,
      variedades: [],
      proceso: '',
      tipo_lote: 'Lote Verde',
      id_user: '',
      clasificacion: '',
      costo: 0,
      id_lote: '',
      fecha_registro: new Date(),
      eliminado: false
    };
  }

  normalize(data: any): Lote {
    console.log('normalize input:', data, 'type:', typeof data);

    if (!data) return this.emptyLote();

    // Por si viene como string JSON
    let parsed = data;

    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch (error) {
        console.error('No se pudo parsear objeto historial:', error);
        return this.emptyLote();
      }
    }

    return {
      ...this.emptyLote(),
      ...parsed,
      productor: parsed.productor ?? '',
      finca: parsed.finca ?? '',
      distrito: parsed.distrito ?? '',
      departamento: parsed.departamento ?? '',
      peso: Number(parsed.peso ?? 0),
      variedades: Array.isArray(parsed.variedades) ? parsed.variedades : [],
      proceso: parsed.proceso ?? '',
      tipo_lote: parsed.tipo_lote ?? 'Lote Verde',
      id_user: parsed.id_user ?? '',
      clasificacion: parsed.clasificacion ?? '',
      costo: Number(parsed.costo ?? 0),
      id_lote: parsed.id_lote ?? '',
      fecha_registro: parsed.fecha_registro ? new Date(parsed.fecha_registro) : new Date(),
      eliminado: Boolean(parsed.eliminado ?? false)
    };
  }

  getVariedadesText(variedades: any): string {
    if (!Array.isArray(variedades)) return '';
    return variedades.join(', ');
  }

  hasChanged(field: keyof Lote): boolean {
    const beforeValue = this.normalizeValue(this.antes?.[field]);
    const afterValue = this.normalizeValue(this.despues?.[field]);

    return beforeValue !== afterValue;
  }

  private normalizeValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(',').trim().toLowerCase();
    }

    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value).trim().toLowerCase();
  }

  getInputClass(field: keyof Lote, side: 'before' | 'after'): string {
    const base =
      'w-full border rounded-lg px-3 py-2 text-gray-700 disabled:opacity-100';

    const normal =
      side === 'before'
        ? ' border-[#E5E5E5] bg-gray-100'
        : ' border-[#E5E5E5] bg-white';

    const changedBefore =
      ' border-red-300 bg-red-50 text-red-700 font-medium';

    const changedAfter =
      ' border-[#F0B27A] bg-[#FFF3E8] text-[#B8672E] font-medium';

    if (!this.hasChanged(field)) {
      return base + normal;
    }

    return base + (side === 'before' ? changedBefore : changedAfter);
  }
}