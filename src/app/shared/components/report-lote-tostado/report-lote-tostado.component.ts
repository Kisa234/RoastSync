import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoastsService } from '../../../features/roasts/service/roasts.service';
import { Tueste } from '../../models/tueste';
import { jsPDF } from 'jspdf';
import { CommonModule, DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import { LucideAngularModule, Download} from 'lucide-angular';
import { FichaTueste } from '../../models/ficha-tueste';
import { LoteTostadoService } from '../../../features/inventory/service/lote-tostado.service';

@Component({
  selector: 'report-lote-tostado',
  imports: [DatePipe, CommonModule, LucideAngularModule],
  templateUrl: './report-lote-tostado.component.html',
  styles: ``
})
export class ReportLoteTostadoComponent implements OnInit {
  @Input() id!: string;
  tuestes: Tueste[] = [];
  currentDate = new Date();

  ficha: FichaTueste = {
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

  readonly Download = Download;

  @ViewChild('pdfContent', { static: false })
  pdfContent!: ElementRef<HTMLDivElement>;

  constructor(
    private roastSvc: RoastsService,
    private loteTostadoSvc: LoteTostadoService,
    private route: ActivatedRoute
  ) { }

 
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadTuestes();
  }

  private loadFicha() {
    this.loteTostadoSvc.getFichaTueste(this.id)
      .subscribe(data => this.ficha = data);
  }

  formatTiempoSegundos(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.round(segundos % 60);
    return `${minutos}min ${segundosRestantes}s`;
  }

  private loadTuestes() {
    this.roastSvc.getTuestesByLote(this.id)
      .subscribe(data => this.tuestes = data.sort((a, b) => a.num_batch - b.num_batch))
      .add(() => this.loadFicha());
  }

  exportPdf() {
    html2canvas(this.pdfContent.nativeElement)
      .then(canvas => {
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'pt', 'a4');
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(img, 'PNG', 0, 0, w, h);
        pdf.save(`reporte-lote-${this.id}.pdf`);
      });
  }
}
