import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, FileSpreadsheet, Download } from 'lucide-angular';
import { RoastsService } from '../../../features/roasts/service/roasts.service';
import { LoteTostadoService } from '../../../features/inventory/service/lote-tostado.service';
import { Tueste } from '../../models/tueste';
import { FichaTueste } from '../../models/ficha-tueste';
import { formatDate } from '@angular/common';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'report-lote-tostado',
  templateUrl: './report-lote-tostado.component.html',
  styleUrl: './report-lote-tostado.component.css',
  standalone: true,
  imports: [
    LucideAngularModule,
    FormsModule,
    CommonModule
  ]
})
export class ReportLoteTostadoComponent implements OnInit {
  @Input() id!: string;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef<HTMLElement>;

  readonly Download = Download;
  readonly FileSpreadsheet = FileSpreadsheet

  currentDate: Date = new Date();
  ficha: FichaTueste = {
    id_lote: '', humedad: 0, densidad: 0, caramelizacion: 0,
    desarrollo: 0, temp_desarrollo: 0, agtrom: 0,
    tiempo: 0, tueste: '', id_lote_tostado: '', peso_total: 0
  };
  tuestes: Tueste[] = [];

  constructor(
    private route: ActivatedRoute,
    private roastSvc: RoastsService,
    private loteTostadoSvc: LoteTostadoService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || this.id;
    this.loadTuestes();
  }

  private loadFicha(): void {
    this.loteTostadoSvc.getFichaTueste(this.id)
      .subscribe(data => this.ficha = data);
  }

  private loadTuestes(): void {
    this.roastSvc.getTuestesByLote(this.id)
      .subscribe(data => {
        this.tuestes = data.sort((a, b) => a.num_batch - b.num_batch);
        this.loadFicha();
      });
  }

  formatTiempoSegundos(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRest = Math.round(segundos % 60);
    return `${minutos}min ${segundosRest}s`;
  }

  async exportExcel() {
    // Carga dinámica para evitar problemas con SSR y reducir bundle
    const XLSX = await import('xlsx');
    const { utils, writeFileXLSX } = XLSX;

    // ---- 1) Datos Generales (una sola fila) ----
    const generales = [{
      'Lote': this.id,
      'Fecha': this.currentDate ? formatDate(this.currentDate, 'dd/MM/yyyy', 'es-PE') : '',
      'Humedad (%)': this.ficha?.humedad ?? '',
      'Densidad': this.ficha?.densidad ?? '',
      '% Caramelización': this.ficha?.caramelizacion ?? '',
      'Desarrollo': this.ficha?.desarrollo ?? '',
      'Temp. Desarrollo': this.ficha?.temp_desarrollo ?? '',
      'Agtrom Comercial': this.ficha?.agtrom ?? '',
      'Tiempo Total': this.formatTiempoSegundos?.(this.ficha?.tiempo) ?? '',
      'Tueste': this.ficha?.tueste ?? '',
      'Peso Total': this.ficha?.peso_total ?? ''
    }];

    // ---- 2) Variables de Tueste (una fila por batch) ----
    // (mapeo de tu tabla actual: Batch, Peso Entrada, Tostadora, etc.)
    const variables = (this.tuestes ?? []).map((t: Tueste) => ({
      'Batch': t.num_batch,
      'Peso Entrada': t.peso_entrada,
      'Tostadora': t.tostadora,
      'Densidad': t.densidad,
      'Humedad': t.humedad,
      'Temperatura Entrada': t.temperatura_entrada,
      'Llama Inicial': t.llama_inicial,
      'Aire Inicial': t.aire_inicial,
      'Pto No Retorno': t.punto_no_retorno,
      'Tiempo despues de Crack': t.tiempo_despues_crack,
      'Temp Crack': t.temperatura_crack,
      'Temp Salida': t.temperatura_salida,
      'Tiempo Total': t.tiempo_total,
      '% Caramelizacion': t.porcentaje_caramelizacion,
      'Desarrollo': t.desarrollo,
      'Grados Desarrallo': t.grados_desarrollo,
      'Agtrom Comercial': t.agtrom_comercial,
      'Agtrom Gourmet': t.agtrom_gourmet,
      'Gourmet': t.agtrom_gourmet,
      'Peso Salida': t.peso_salida,
      'Merma': t.merma,
    }));

    // ---- helpers de autofit ----
    const fitToColumns = (rows: any[]) => {
      if (!rows.length) return [];
      const headers = Object.keys(rows[0]);
      return headers.map(h => ({
        wch: Math.max(
          h.length,
          ...rows.map(r => (r[h] ?? '').toString().length)
        ) + 2
      }));
    };

    // ---- construir workbook ----
    const wb = utils.book_new();
    const wsGenerales = utils.json_to_sheet(generales);
    const wsVariables = utils.json_to_sheet(variables);

    wsGenerales['!cols'] = fitToColumns(generales);
    wsVariables['!cols'] = fitToColumns(variables);

    // (Opcional) Formatos de números/porcentajes: ejemplo para % Carameliz. y Merma
    const applyNumberFormat = (ws: any, header: string, fmt: string) => {
      const range = utils.decode_range(ws['!ref'] as string);
      const headers = Object.keys(utils.sheet_to_json(ws, { header: 1 })[0] as any);
      const colIdx = headers.indexOf(header);
      if (colIdx === -1) return;
      for (let r = 1; r <= range.e.r; r++) {
        const addr = utils.encode_cell({ r, c: colIdx });
        if (ws[addr]?.t === 'n') ws[addr].z = fmt; // p.ej. '0.00' o '0.00%'
      }
    };
    applyNumberFormat(wsVariables, '% Carameliz.', '0.00');
    applyNumberFormat(wsVariables, 'Merma', '0.00');

    utils.book_append_sheet(wb, wsGenerales, 'Datos Generales');
    utils.book_append_sheet(wb, wsVariables, 'Variables de Tueste');

    const filename = `Reporte_Tostado_${this.id}_${formatDate(new Date(), 'yyyyMMdd_HHmm', 'es-PE')}.xlsx`;
    writeFileXLSX(wb, filename);
  }

  exportPdf(): void {
    const host = document.getElementById('pdfContent');
    if (!host) return;

    const pages = Array.from(host.querySelectorAll<HTMLElement>('.page-container'));
    const pageHtml = (pages.length ? pages : [host]).map(el => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.no-print,[data-no-print]').forEach(n => n.remove());
      return `<div class="page-container">${clone.innerHTML}</div>`;
    }).join('');

    // 1) Copiamos <link rel="stylesheet"> para asegurar Tailwind/estilos
    const linksHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(l => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`)
      .join('');

    // 2) También extraemos reglas de estilos locales (no cross-origin)
    const extractedStyles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from((sheet as CSSStyleSheet).cssRules || [])
            .map(r => (r as CSSRule).cssText).join('\n');
        } catch { return ''; }
      }).join('\n');

    // 3) CSS para print-window (landscape + evitar cortes/overflow)
    const pageCss = `
    @page { size: A4 landscape; margin: 10mm; }

    html, body { height: 100%; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .page-container {
      position: relative;
      width: 277mm;       /* 297 - (10mm*2) */
      min-height: 190mm;
      margin: 0 auto;
      page-break-after: always;
      overflow: hidden;
    }
    .page-container:last-child { page-break-after: auto; }

    .print-page { box-sizing: border-box; height: 100%; }

    /* ❗ Quitar scroll para que no se corte a la derecha */
    .overflow-x-auto, .overflow-auto, .overflow-hidden, .overflow-scroll {
      overflow: visible !important;
    }

    table { width: 100% !important; border-collapse: collapse !important; table-layout: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tbody tr { break-inside: avoid; page-break-inside: avoid; }
    th, td { padding: 2px 4px !important; font-size: 11px !important; }

    /* Evitar bugs de sticky en impresión */
    .sticky, .sticky th, .sticky td { position: static !important; }

    /* Opcional: limpiar sombras para que no pixelen */
    .shadow, .shadow-md, .shadow-lg { box-shadow: none !important; }
  `;

    // 4) Base href para que rutas relativas funcionen en la ventana
    const baseHref =
      (document.querySelector('base') as HTMLBaseElement)?.href || document.baseURI;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;

    w.document.open();
    w.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}">
        ${linksHtml}
        <style>${pageCss}</style>
        <style>${extractedStyles}</style>
        <title>Reporte_Lote_Tostado_${this.id}</title>
      </head>
      <body>${pageHtml}</body>
    </html>
  `);
    w.document.close();

    // 5) Imprime cuando carguen hojas/recursos
    w.addEventListener('load', () => {
      (w.document as any).fonts?.ready?.finally(() => {
        setTimeout(() => { try { w.focus(); w.print(); } finally { w.close(); } }, 100);
      });
    });
  }


}
