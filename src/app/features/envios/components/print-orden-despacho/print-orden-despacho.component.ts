import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Download } from 'lucide-angular';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

export interface ItemImprimible {
  id_entidad: string;
  cantidad: number;
  unidad_medida: string;
}

export interface DireccionImprimible {
  nombre_destinatario: string;
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  referencia?: string | null;
  observaciones?: string | null;
}

export interface OrdenDespachoImprimible {
  numero_orden: string;
  id_cliente: string;
  fecha: string;
  fecha_programada?: string | null;
  direccion?: DireccionImprimible | null;
  medio_envio?: string | null;
  numero_tracking?: string | null;
  quien_paga?: string | null;
  items: ItemImprimible[];
}

@Component({
  selector: 'print-orden-despacho',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserNamePipe],
  templateUrl: './print-orden-despacho.component.html',
})
export class PrintOrdenDespachoComponent {
  @Input({ required: true }) data!: OrdenDespachoImprimible;
  @Output() close = new EventEmitter<void>();

  readonly X = X;
  readonly Download = Download;

  exporting = false;

  onCancel(): void {
    this.close.emit();
  }

  async onExportImage(): Promise<void> {
    const element = document.getElementById('orden-despacho-print-area');
    if (!element) return;

    this.exporting = true;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2, // más resolución, texto nítido
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Orden_Despacho_${this.data.numero_orden}.png`;
      a.click();
    } catch (err) {
      console.error('[PrintOrdenDespacho] Error exportando imagen:', err);
    } finally {
      this.exporting = false;
    }
  }
}