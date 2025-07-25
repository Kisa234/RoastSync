import { CommonModule } from '@angular/common';
import { LoteTostado } from './../../../../shared/models/lote-tostado';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, output, ViewChild } from '@angular/core';
import { FichaTueste } from '../../../../shared/models/ficha-tueste';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { LucideAngularModule, Download } from 'lucide-angular';

@Component({
  selector: 'ficha-tueste',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './ficha-tueste.component.html',
  styles: ``
})
export class FichaTuesteComponent implements OnInit {
  @Input() id: string = '';
  @Output() close = new EventEmitter<void>();
  readonly Download = Download;
  @ViewChild('fichaPrint', { static: false }) fichaPrint!: ElementRef;

  data: FichaTueste = {
    id_lote: '',
    humedad: 0,
    densidad: 0,
    caramelizacion: 0,
    desarrollo: 0,
    temp_desarrollo: 0,
    agtrom: 0,
    tiempo: 0,
    tueste: '',
    id_lote_tostado: '',
    peso_total: 0,
  }

  constructor(
    readonly loteTostadoSvc: LoteTostadoService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loteTostadoSvc.getFichaTueste(this.id).subscribe(data => {
      this.data = data;
    });
  }

  formatTiempoSegundos(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.round(segundos % 60);
    return `${minutos}min ${segundosRestantes}s`;
  }

  OnClose() {
    this.close.emit();
  }

  async downloadModalImage(): Promise<void> {
    const { default: html2canvas } = await import('html2canvas-pro');

    // 1) Clonar elemento si quieres aislar estilos (opcional)
    const original = this.fichaPrint.nativeElement as HTMLElement;
    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${original.offsetWidth}px`;
    // lo insertamos off-screen para no romper el layout
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '-9999px',
      width: clone.style.width
    });
    container.appendChild(clone);
    document.body.appendChild(container);

    // 2) Renderizar a canvas
    html2canvas(clone, {
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: original.scrollWidth,
      height: original.scrollHeight
    })
      .then(canvas => {
        // 3) Limpiar
        document.body.removeChild(container);

        // 4) Convertir a blob y disparar descarga
        canvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lote-${this.data.id_lote}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      })
      .catch(err => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        console.error('Error al capturar imagen del modal', err);
      });
  }
}
