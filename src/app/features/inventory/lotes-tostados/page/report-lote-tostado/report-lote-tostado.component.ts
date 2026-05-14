import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, FileSpreadsheet, Download, TestTube, ArrowLeft, Pencil } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { MinSecPipe } from '../../../../../shared/pipes/time.pipe';
import { FichaTueste } from '../../../../../shared/models/ficha-tueste';
import { Tueste } from '../../../../../shared/models/tueste';
import { RoastsService } from '../../../../roasts/service/roasts.service';
import { LoteTostadoService } from '../../service/lote-tostado.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { EditRoastCompletedComponent } from '../../../../roasts/components/edit-roast-completed/edit-roast-completed.component';

@Component({
  selector: 'report-lote-tostado',
  templateUrl: './report-lote-tostado.component.html',
  styleUrl: './report-lote-tostado.component.css',
  standalone: true,
  imports: [
    LucideAngularModule,
    FormsModule,
    CommonModule,
    UserNamePipe,
    MinSecPipe,
    EditRoastCompletedComponent
  ]
})
export class ReportLoteTostadoComponent implements OnInit {
  @Input() id!: string;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef<HTMLElement>;

  readonly Download = Download;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly TestTube = TestTube;
  readonly ArrowLeft = ArrowLeft;
  readonly Pencil = Pencil;

  editingRoastId: string | null = null;
  clienteNombre: string = '';
  currentDate: Date = new Date();
  ficha: FichaTueste = {
    id_lote: '', humedad: 0, densidad: 0, caramelizacion: 0,
    desarrollo: 0, temp_desarrollo: 0, agtrom: 0,
    tiempo: 0, tueste: '', id_lote_tostado: '', peso_total: 0,
    agtrom_gourmet: 0,
    merma: 0,
    merma_gr: 0
  };
  tuestes: Tueste[] = [];

  constructor(
    private route: ActivatedRoute,
    private roastSvc: RoastsService,
    private loteTostadoSvc: LoteTostadoService,
    private userService: UserService,
    private location: Location,
    private uiService: UiService
  ) { }


  goBack(): void {
    this.location.back();
  }

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
      .subscribe(async data => {
        this.tuestes = data.sort((a, b) => a.num_batch - b.num_batch);

        // Resolver nombre del cliente
        if (this.tuestes[0]?.id_cliente) {
          try {
            const user = await firstValueFrom(
              this.userService.getUserById(this.tuestes[0].id_cliente)
            );
            this.clienteNombre = user?.nombre_comercial || user?.nombre || this.tuestes[0].id_cliente;
          } catch {
            this.clienteNombre = this.tuestes[0].id_cliente;
          }
        }

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
      'Tiempo despues de Crack': this.formatTiempoSegundos(t.tiempo_despues_crack),
      'Temp Crack': t.temperatura_crack,
      'Temp Salida': t.temperatura_salida,
      'Tiempo Total': this.formatTiempoSegundos(t.tiempo_total),
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

  async exportPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    this.uiService.showProgress('Generando PDF...', 5);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;

    // ── LOGOS ──
    this.uiService.showProgress('Cargando logos...', 15);
    let logoIzq = '', logoDer = '', logoFinal = '';
    let dimIzq = { w: 0, h: 0 }, dimDer = { w: 0, h: 0 }, dimFinal = { w: 0, h: 0 };
    try {
      logoIzq = await this.imageToBase64('assets/img/lo-bueno-negro-rojo.png');
      logoDer = await this.imageToBase64('assets/img/logotipo.png');
      logoFinal = await this.imageToBase64('assets/img/logo-negro.png');
      dimIzq = await this.getImgDimensions(logoIzq, 50, 14);
      dimDer = await this.getImgDimensions(logoDer, 50, 14);
      dimFinal = await this.getImgDimensions(logoFinal, 40, 12);
    } catch (e) {
      console.warn('Logos no cargados', e);
    }

    this.uiService.showProgress('Construyendo encabezado...', 35);
    const logoH = 14;
    if (logoIzq) pdf.addImage(logoIzq, 'PNG', margin, margin + (logoH - dimIzq.h) / 2, dimIzq.w, dimIzq.h);
    if (logoDer) pdf.addImage(logoDer, 'PNG', pageWidth - margin - dimDer.w, margin + (logoH - dimDer.h) / 2, dimDer.w, dimDer.h);

    let y = margin + logoH + 6;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);

    pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte Lote Tostado', margin, y + 6);
    y += 14;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold'); pdf.text('Cliente:', margin, y);
    pdf.setFont('helvetica', 'normal'); pdf.text(` ${this.clienteNombre}`, margin + 14, y); y += 5;
    pdf.setFont('helvetica', 'bold'); pdf.text('Lote:', margin, y);
    pdf.setFont('helvetica', 'normal'); pdf.text(` ${this.id}`, margin + 10, y); y += 5;
    pdf.setFont('helvetica', 'bold'); pdf.text('Fecha:', margin, y);
    pdf.setFont('helvetica', 'normal');
    const fecha = this.tuestes[0]?.fecha_tueste
      ? new Date(this.tuestes[0].fecha_tueste).toLocaleDateString('es-PE') : '';
    pdf.text(` ${fecha}`, margin + 12, y);
    y += 10;

    // ── DATOS GENERALES ──
    this.uiService.showProgress('Agregando datos generales...', 55);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('Datos Generales', margin, y);
    y += 5;

    const generales = [
      ['Humedad', `${this.ficha.humedad?.toFixed(2)}%`, 'Densidad', `${this.ficha.densidad?.toFixed(2)}`],
      ['% Caramelización', `${this.ficha.caramelizacion?.toFixed(2)}%`, 'Desarrollo', `${this.ficha.desarrollo?.toFixed(2)}`],
      ['Tueste', this.ficha.tueste, 'Temp. Desarrollo', `${this.ficha.temp_desarrollo?.toFixed(2)}`],
      ['Agtrom Comercial', `${this.ficha.agtrom?.toFixed(2)}`, 'Tiempo', this.formatTiempoSegundos(this.ficha.tiempo)],
      ['Peso Total', `${this.ficha.peso_total}`, '', ''],
    ];

    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin },
      body: generales, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: contentWidth * 0.2 },
        1: { cellWidth: contentWidth * 0.3 },
        2: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: contentWidth * 0.2 },
        3: { cellWidth: contentWidth * 0.3 },
      },
    });

    y = (pdf as any).lastAutoTable.finalY + 8;

    // ── VARIABLES DE TUESTE ──
    this.uiService.showProgress('Generando tabla de batches...', 75);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('Variables de Tueste', margin, y);
    pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
    pdf.text(`${this.tuestes.length} registros`, pageWidth - margin, y, { align: 'right' });
    y += 5;

    const headers = [
      'Batch', 'Peso\nEntrada', 'Tostadora', 'Temp\nEntr.', 'Llama\nInic.',
      'Aire\nInic.', 'Pto No\nRetorno', 'T. Crack', 'Temp\nCrack',
      'Temp\nSalida', 'T. Total', '% Car.', 'Desarr.', 'Grados\nDes.',
      'Agtrom\nCom.', 'Agtrom\nGour.', 'Peso\nSalida', 'Merma'
    ];

    const rows = this.tuestes.map(t => [
      t.num_batch, t.peso_entrada, t.tostadora, t.temperatura_entrada,
      t.llama_inicial, t.aire_inicial, t.punto_no_retorno,
      this.formatTiempoSegundos(t.tiempo_despues_crack),
      t.temperatura_crack, t.temperatura_salida,
      this.formatTiempoSegundos(t.tiempo_total),
      t.porcentaje_caramelizacion, t.desarrollo, t.grados_desarrollo,
      t.agtrom_comercial, t.agtrom_gourmet, t.peso_salida, t.merma,
    ]);

    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin },
      head: [headers], body: rows, theme: 'striped',
      styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { cellWidth: 8 }, 2: { halign: 'left' } },
      didDrawPage: () => {
        pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${pdf.getNumberOfPages()}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
        if (logoFinal) {
          pdf.addImage(logoFinal, 'PNG', (pageWidth - dimFinal.w) / 2, pageHeight - margin - dimFinal.h, dimFinal.w, dimFinal.h);
        }
      }
    });

    // ── GUARDAR ──
    this.uiService.showProgress('Guardando archivo...', 90);
    await new Promise(r => setTimeout(r, 100)); // tick para que se vea el 90%

    pdf.save(`Reporte_Lote_Tostado_${this.id}.pdf`);

    this.uiService.clearProgress();
    this.uiService.alert('success', 'PDF generado', 'El reporte se descargó correctamente.');
  }

  private getImgDimensions(base64: string, maxW: number, maxH: number): Promise<{ w: number, h: number }> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        let w = maxW;
        let h = w / ratio;
        if (h > maxH) {
          h = maxH;
          w = h * ratio;
        }
        resolve({ w, h });
      };
      img.src = base64;
    });
  }

  private async imageToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async exportSticker(t: Tueste) {
    const lote = t.id_lote ?? this.id ?? '';
    const fecha = formatDate(this.currentDate, 'dd/MM/yyyy', 'es-PE');
    const batch = String(t.num_batch ?? '');

    // 1) Traer cliente antes de dibujar
    let cliente = '';
    try {
      const user = await firstValueFrom(this.userService.getUserById(t.id_cliente));
      cliente = user?.nombre_comercial || user?.nombre || '';
    } catch { }

    // 2) Lienzo más grande (ancho ↑, altura ↑)
    const W = 1400, H = 360, dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);

    // Fondo y borde
    ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W - 2, H - 2);

    // Layout (sum = 1400). Amplié la columna de FECHA a 260.
    const cols = [140, 520, 480, 260]; // Batch, Lote, Cliente, Fecha
    const x = [20, 20 + cols[0], 20 + cols[0] + cols[1], 20 + cols[0] + cols[1] + cols[2]];
    const yHeader = 70, yValue = 170;

    // Encabezados
    ctx.font = '600 26px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#111';
    ['Batch', 'Lote', 'Cliente', 'Fecha'].forEach((h, i) => ctx.fillText(h, x[i], yHeader));
    ctx.beginPath(); ctx.moveTo(20, yHeader + 16); ctx.lineTo(W - 20, yHeader + 16);
    ctx.lineWidth = 1; ctx.strokeStyle = '#999'; ctx.stroke();

    // Valores: 36px. NO achicar la fecha.
    const valueFont = '500 36px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.font = valueFont; ctx.fillStyle = '#111';

    const drawFit = (text: string, xi: number, maxW: number) => {
      // permite achicar SOLO para batch/lote/cliente (no fecha)
      let size = 36;
      ctx.font = valueFont;
      while (ctx.measureText(text).width > maxW && size > 12) {
        size -= 1;
        ctx.font = valueFont.replace(/\d+px/, size + 'px');
      }
      ctx.fillText(text, xi, yValue);
      ctx.font = valueFont; // reset
    };

    drawFit(batch, x[0], cols[0] - 30);
    drawFit(String(lote), x[1], cols[1] - 30);
    drawFit(cliente, x[2], cols[2] - 30);

    // Fecha fija a 36px, sin truncar
    ctx.font = valueFont;
    ctx.fillText(fecha, x[3], yValue);

    // Descargar
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `Sticker_${lote}_B${batch}_${formatDate(t.fecha_tueste, 'yyyyMMdd', 'es-PE')}.png`;
    a.click(); a.remove();
  }

  onRoastSaved(updated: Tueste): void {
    const idx = this.tuestes.findIndex(t => t.id_tueste === updated.id_tueste);
    if (idx !== -1) {
      this.tuestes[idx] = updated;
      this.tuestes = [...this.tuestes];
    }
    this.loadFicha();
  }
}


