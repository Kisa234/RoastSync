import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { Download, X, LucideAngularModule } from 'lucide-angular';
import { AnalisisRapidoService } from '../../../analysis/service/analisis-rapido.service';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { AnalisisRapido } from '../../../../shared/models/analisis-rapido';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'report-lote-tostado',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './report-lote-tostado.component.html',
  styles: ``
})
export class ReportLoteTostadoComponent implements OnInit {
  @Input() loteId: string = '';
  @Output() close = new EventEmitter<void>();
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  readonly Download = Download;
  readonly X = X;

  loteTostado: LoteTostado = {
    id_lote_tostado: '',
    id_lote: '',
    fecha_tostado: new Date(),
    perfil_tostado: '',
    peso: 0,
    fecha_registro: new Date(),
    id_user: ''
  };

  analisisRapido: AnalisisRapido = {
    id_analisis_rapido: '',
    fecha_registro: new Date(),
    fragancia: '',
    aroma: '',
    floral: false,
    afrutado: false,
    bayas: false,
    frutos_secos: false,
    citricos: false,
    acido_fermentado: false,
    acido: false,
    fermentado: false,
    verde_vegetal: false,
    otros: false,
    quimico: false,
    rancio: false,
    tierra: false,
    papel: false,
    tostado: false,
    nueces_cacao: false,
    nueces: false,
    cocoa: false,
    especias: false,
    dulce: false,
    vainilla: false,
    azucar_morena: false,
    eliminado: false
  };

  cargado = false;

  constructor(
    private readonly analisisRapidoSvc: AnalisisRapidoService,
    private readonly loteTostadoSvc: LoteTostadoService
  ) { }

  ngOnInit(): void {
    if (!this.loteId) {
      console.error('No se recibió un ID de lote tostado válido');
      return;
    }

    this.loteTostadoSvc.getById(this.loteId).subscribe({
      next: (lote) => {
        this.loteTostado = lote;

        // Si el lote tiene análisis rápido, lo carga también
        if (lote.id_analisis_rapido) {
          this.analisisRapidoSvc.getAnalisisById(lote.id_analisis_rapido).subscribe({
            next: (analisis) => {
              this.analisisRapido = analisis;
              this.cargado = true;
            },
            error: (err) => {
              console.error('Error al obtener el análisis rápido:', err);
              this.cargado = true;
            }
          });
        } else {
          this.cargado = true;
        }
      },
      error: (err) => {
        console.error('Error al obtener el lote tostado:', err);
        this.cargado = true;
      }
    });
  }


  closeModal(): void {
    this.close.emit();
  }

  exportPdf(): void {
    const element = this.pdfContent.nativeElement;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`analisis-rapido-${this.loteTostado.id_lote_tostado}.pdf`);
    });
  }
}
