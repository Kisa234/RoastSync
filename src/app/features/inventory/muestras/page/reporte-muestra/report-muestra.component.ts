import { CommonModule, NgIf, Location } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Download, ArrowLeft, LucideAngularModule } from 'lucide-angular';

import { SpiderGraphComponent } from '../../../../../shared/components/spider-graph/spider-graph.component';
import { MultiPieChartComponent } from '../../../../../shared/components/multi-pie-chart/multi-pie-chart.component';
import { NotasSensorialesPipe } from '../../../../../shared/pipes/notas.pipe';
import { UiService } from '../../../../../shared/services/ui.service';

import { Muestra } from '../../../../../shared/models/muestra';
import { Analisis } from '../../../../../shared/models/analisis';
import { AnalisisFisico } from '../../../../../shared/models/analisis-fisico';
import { AnalisisSensorial } from '../../../../../shared/models/analisis-sensorial';
import { AnalisisDefectos } from '../../../../../shared/models/analisis-defectos';
import { User } from '../../../../../shared/models/user';

import { MuestraService } from '../../service/muestra.service';
import { AnalisisService } from '../../../../analysis/service/analisis.service';
import { AnalisisFisicoService } from '../../../../analysis/service/analisis-fisico.service';
import { AnalisisSensorialService } from '../../../../analysis/service/analisis-sensorial.service';
import { AnalisisDefectosService } from '../../../../analysis/service/analisis-defectos.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UbigeoService } from '../../../../../shared/services/ubigeo.service';
import { inferirProvincia } from '../../../../../shared/utils/ubigeo.utils';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'report-muestra',
  imports: [NgIf, CommonModule, SpiderGraphComponent, LucideAngularModule, NotasSensorialesPipe, MultiPieChartComponent],
  templateUrl: './report-muestra.component.html',
  styles: ` `
})
export class ReportMuestraComponent implements OnInit {
  @Input() id: string = '';
  readonly Download = Download;
  readonly ArrowLeft = ArrowLeft;

  // Los gráficos exportan su propia imagen (ApexCharts/ECharts) para el PDF.
  @ViewChild(SpiderGraphComponent) spiderGraphComp!: SpiderGraphComponent;
  @ViewChild(MultiPieChartComponent) multiPie!: MultiPieChartComponent;

  muestra: Muestra = {
    id_muestra: '',
    owned_by_store: false,
    peso: 0,
    variedades: [],
    proceso: '',
    fecha_registro: new Date(),
    eliminado: false,
    productor: '',
    finca: '',
    distrito: '',
    departamento: '',
    completado: false
  };

  analisisFisico: AnalisisFisico = {
    id_analisis_fisico: '',
    fecha_registro: new Date(),
    peso_muestra: 0,
    peso_pergamino: 0,
    wa: 0,
    temperatura_wa: 0,
    humedad: 0,
    temperatura_humedad: 0,
    densidad: 0,
    color_grano_verde: '',
    olor: '',
    superior_malla_18: 0,
    superior_malla_16: 0,
    superior_malla_14: 0,
    menor_malla_14: 0,
    peso_defectos: 0,
    quaquers: 0,
    peso_muestra_tostada: 0,
    desarrollo: 0,
    porcentaje_caramelizacion: 0,
    c_desarrollo: 0,
    comentario: ''
  };

  analisisSensorial: AnalisisSensorial = {
    id_analisis_sensorial: '',
    fragancia_aroma: 0,
    sabor: 0,
    sabor_residual: 0,
    acidez: 0,
    cuerpo: 0,
    uniformidad: 0,
    balance: 0,
    taza_limpia: 0,
    dulzor: 0,
    puntaje_catador: 0,
    taza_defecto_ligero: 0,
    tazas_defecto_rechazo: 0,
    puntaje_taza: 0,
    comentario: '',
    fecha_registro: new Date(),
  };

  analisisDefectos: AnalisisDefectos = {
    id_analisis_defectos: '',
    grano_negro: 0,
    grano_agrio: 0,
    grano_con_hongos: 0,
    cereza_seca: 0,
    materia_estrana: 0,
    broca_severa: 0,
    negro_parcial: 0,
    agrio_parcial: 0,
    pergamino: 0,
    flotadores: 0,
    inmaduro: 0,
    averanado: 0,
    conchas: 0,
    cascara_pulpa_seca: 0,
    partido_mordido_cortado: 0,
    broca_leva: 0,
    grado: '',
    fecha_registro: new Date(),
    eliminado: false
  };

  calc: Partial<AnalisisDefectos> = {};

  analisis: Analisis = {
    id_analisis: '',
    fecha_registro: new Date(),
    analisisFisico_id: '',
    analisisSensorial_id: '',
    analisisDefectos_id: '',
    comentario: '',
  };

  user: User = {
    id_user: '',
    nombre: '',
    email: '',
    rol: '',
    password: '',
    numero_telefono: 0,
    eliminado: false,
    fecha_registro: new Date()
  };

  total = 0;
  totalPrimarios = 0;
  totalSecundarios = 0;

  private notasPipe = new NotasSensorialesPipe();

  constructor(
    private muestraService: MuestraService,
    private analisisService: AnalisisService,
    private analisisSensorialService: AnalisisSensorialService,
    private analisisFisicoService: AnalisisFisicoService,
    private analisisDefectosService: AnalisisDefectosService,
    private userService: UserService,
    private ubigeoSvc: UbigeoService,
    private ui: UiService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.id = this.id || this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  goBack(): void {
    this.location.back();
  }

  private loadData(): void {
    this.muestraService.getById(this.id).subscribe({
      next: muestra => {
        this.muestra = muestra;
        this.deducirProvinciaSiFalta(muestra.departamento, muestra.provincia, muestra.distrito);

        if (muestra.id_analisis) {
          this.analisisService.getAnalisisById(muestra.id_analisis).subscribe({
            next: analisis => {
              this.analisis = analisis;
              this.analisisFisicoService.getAnalisisById(analisis.analisisFisico_id!).subscribe({
                next: f => this.analisisFisico = f,
                error: e => console.error('[ReportMuestra] ERROR fisico', e),
              });
              this.analisisSensorialService.getAnalisisById(analisis.analisisSensorial_id!).subscribe({
                next: s => this.analisisSensorial = s,
                error: e => console.error('[ReportMuestra] ERROR sensorial', e),
              });
              this.analisisDefectosService.getAnalisisById(analisis.analisisDefectos_id!).subscribe({
                next: d => {
                  this.analisisDefectos = d;
                  this.calcGrado();
                },
                error: e => console.error('[ReportMuestra] ERROR defectos', e),
              });
            },
            error: e => console.error('[ReportMuestra] ERROR analisis', e),
          });
        } else {
          console.warn('[ReportMuestra] la muestra no tiene id_analisis');
        }

        if (muestra.owned_by_store) {
          this.user = { ...this.user, nombre: 'FORTUNATO' };
        } else if (muestra.id_user) {
          this.userService.getUserById(muestra.id_user).subscribe({
            next: user => this.user = user,
            error: e => console.error('[ReportMuestra] ERROR user', e),
          });
        }
      },
      error: e => {
        console.error('[ReportMuestra] ERROR muestraService.getById', e);
        this.ui.alert('error', 'Error', 'No se pudo cargar la muestra.');
      },
    });
  }

  // ── Datos generales (rotulado) ─────────────────────────────────

  /** Provincia deducida por ubigeo para registros antiguos que no la tienen guardada */
  provinciaInferida = '';

  /** Nombre del producto para el rotulado: "<ID> - Café oro verde" */
  get productoTexto(): string {
    return this.muestra.id_muestra ? `${this.muestra.id_muestra} - Café oro verde` : '';
  }

  private deducirProvinciaSiFalta(departamento?: string, provincia?: string | null, distrito?: string) {
    if (provincia || !departamento || !distrito) return;
    this.ubigeoSvc.getDepartamentos().subscribe(deps => {
      const dept = deps.find(d => d.nombre.trim().toUpperCase() === departamento.trim().toUpperCase());
      if (!dept) return;
      forkJoin({
        provincias: this.ubigeoSvc.getProvincias(dept.codigo),
        distritos: this.ubigeoSvc.getDistritoByDepartamento(dept.codigo),
      }).subscribe(({ provincias, distritos }) => {
        this.provinciaInferida = inferirProvincia(distrito, distritos, provincias)?.nombre ?? '';
      });
    });
  }

  /** Origen: Departamento - Provincia - Distrito (la finca va aparte) */
  get origen(): string {
    const m = this.muestra;
    const provincia = m.provincia || this.provinciaInferida;
    return [m.departamento, provincia, m.distrito].filter(Boolean).join(' - ');
  }

  get alturaTexto(): string {
    return this.muestra.altura ? `${this.muestra.altura} msnm` : '';
  }

  get anioCosechaTexto(): string {
    return this.muestra.anio_cosecha ? String(this.muestra.anio_cosecha) : '';
  }

  // El backend a veces manda `variedades` como string ("Caturra, Bourbon")
  // y otras como array — se normaliza aquí para el HTML y el PDF.
  get variedadesTexto(): string {
    const v = this.muestra.variedades as unknown;
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'string') {
      return v.split(',').map(s => s.trim()).filter(Boolean).join(', ');
    }
    return '';
  }

  // ───────────────────────────────────────────────────────────────

  // Mismos divisores que el reporte de lote. Aquí sí se asigna
  // calc.grano_negro (en report-lote nunca se seteaba).
  calcGrado(): void {
    this.total = 0;
    this.totalPrimarios = 0;
    this.totalSecundarios = 0;

    const primarios: [keyof AnalisisDefectos, number][] = [
      ['grano_negro', 1],
      ['grano_agrio', 1],
      ['grano_con_hongos', 1],
      ['cereza_seca', 1],
      ['materia_estrana', 1],
      ['broca_severa', 5],
    ];
    const secundarios: [keyof AnalisisDefectos, number][] = [
      ['negro_parcial', 3],
      ['agrio_parcial', 3],
      ['pergamino', 5],
      ['flotadores', 5],
      ['inmaduro', 5],
      ['averanado', 5],
      ['conchas', 5],
      ['cascara_pulpa_seca', 5],
      ['partido_mordido_cortado', 5],
      ['broca_leva', 10],
    ];

    for (const [campo, div] of primarios) {
      const v = Math.floor(((this.analisisDefectos[campo] as number) || 0) / div);
      (this.calc as any)[campo] = v;
      this.totalPrimarios += v;
    }
    for (const [campo, div] of secundarios) {
      const v = Math.floor(((this.analisisDefectos[campo] as number) || 0) / div);
      (this.calc as any)[campo] = v;
      this.totalSecundarios += v;
    }
    this.total = this.totalPrimarios + this.totalSecundarios;
  }

  getAssetUrl(nombre: string): string {
    return `/assets/img/${nombre}`;
  }

  getPorcentage(valor: number, total: number): string {
    if (total === 0) return '0%';
    return `${((valor / total) * 100).toFixed(1)}%`;
  }

  // ── EXPORTAR PDF: mismo formato que report-lote ──
  async exportPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    this.ui.showProgress('Generando PDF...', 5);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const brandRed: [number, number, number] = [237, 40, 55];

    const drawTopBar = () => {
      pdf.setFillColor(...brandRed);
      pdf.rect(0, 0, pageWidth, 2.5, 'F');
    };

    // ── LOGOS / FIRMA ──
    this.ui.showProgress('Cargando logos...', 10);
    let logoIzq = '', logoDer = '', logoFinal = '', firma = '';
    let dimIzq = { w: 0, h: 0 }, dimDer = { w: 0, h: 0 }, dimFinal = { w: 0, h: 0 }, dimFirma = { w: 0, h: 0 };
    try {
      logoIzq = await this.toJpeg(await this.imageToBase64('assets/img/lo-buenos-negro.png'));
      logoDer = await this.toJpeg(await this.imageToBase64('assets/img/fortunato-logo.png'));
      logoFinal = await this.toJpeg(await this.imageToBase64('assets/img/logo-negro.png'));
      dimIzq = await this.getImgDimensions(logoIzq, 58, 32);
      dimDer = await this.getImgDimensions(logoDer, 65, 22);
      dimFinal = await this.getImgDimensions(logoFinal, 40, 16);
      firma = await this.toJpeg(await this.imageToBase64(this.getAssetUrl('firma-renato.png')));
      dimFirma = await this.getImgDimensions(firma, 35, 16);
    } catch (e) {
      console.warn('Logos/firma no cargados', e);
    }

    drawTopBar();

    this.ui.showProgress('Construyendo encabezado...', 20);
    const logoH = Math.max(dimIzq.h, dimDer.h, 14);
    if (logoIzq) pdf.addImage(logoIzq, 'JPEG', margin, margin + (logoH - dimIzq.h) / 2, dimIzq.w, dimIzq.h);
    if (logoDer) pdf.addImage(logoDer, 'JPEG', pageWidth - margin - dimDer.w, margin + (logoH - dimDer.h) / 2, dimDer.w, dimDer.h);

    let y = margin + logoH + 6;
    pdf.setDrawColor(...brandRed);
    pdf.setLineWidth(0.4);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;

    pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Analisis', margin, y + 6);
    y += 14;

    // Datos generales (rotulado). Origen = Departamento - Provincia - Distrito;
    // la Finca va en su propio cuadro.
    const camposHeader: [string, string][] = [
      ['Producto', this.productoTexto],
      ['Cliente', this.user.nombre],
      ['Productor', this.muestra.productor || 'N/A'],
      ['Origen', this.origen],
      ['Finca', this.muestra.finca || ''],
      ['Variedad', this.variedadesTexto],
      ['Proceso', this.muestra.proceso || 'N/A'],
      ['Altitud', this.alturaTexto],
      ['Año de cosecha', this.anioCosechaTexto],
    ];

    // 9 campos → 3 filas de 3 pares (etiqueta | valor), compacto para que
    // los defectos no se empujen a la página 2
    const filasHeader: string[][] = [];
    for (let i = 0; i < camposHeader.length; i += 3) {
      filasHeader.push(
        camposHeader.slice(i, i + 3).flatMap(([label, value]) => [label, value || 'N/A'])
      );
    }

    const labelW = 21;                                  // columnas de etiqueta
    const valueW = (contentWidth - labelW * 3) / 3;     // columnas de valor
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      body: filasHeader,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle' },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [80, 80, 80], cellWidth: labelW },
        1: { cellWidth: valueW },
        2: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [80, 80, 80], cellWidth: labelW },
        3: { cellWidth: valueW },
        4: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [80, 80, 80], cellWidth: labelW },
        5: { cellWidth: valueW },
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 6;

    // ── 1.- ANÁLISIS FÍSICO ──
    this.ui.showProgress('Agregando análisis físico...', 35);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('1.- Análisis Físico', margin, y);
    y += 5;

    const af = this.analisisFisico;
    const fisico = [
      ['Peso de la muestra', `${af.peso_muestra} gr`, 'Peso pergamino', `${af.peso_pergamino} gr`],
      ['WA', `${af.wa}`, 'Temperatura WA', `${af.temperatura_wa} °C`],
      ['Humedad', `${af.humedad} %`, 'Temperatura Humedad', `${af.temperatura_humedad} °C`],
      ['Densidad', `${af.densidad}`, 'Color de grano en verde', af.color_grano_verde],
      ['Olor', af.olor, '', ''],
      ['Superior a malla 18', `${af.superior_malla_18} gr | ${this.getPorcentage(af.superior_malla_18, af.peso_muestra)}`, 'Superior a malla 16', `${af.superior_malla_16} gr | ${this.getPorcentage(af.superior_malla_16, af.peso_muestra)}`],
      ['Superior a malla 14', `${af.superior_malla_14} gr | ${this.getPorcentage(af.superior_malla_14, af.peso_muestra)}`, 'Menor a malla 14', `${af.menor_malla_14} gr | ${this.getPorcentage(af.menor_malla_14, af.peso_muestra)}`],
      ['Peso de defectos', `${af.peso_defectos} gr`, 'Quáquers', `${af.quaquers}`],
      ['Peso de muestra tostada', `${af.peso_muestra_tostada}`, 'Desarrollo', `${af.desarrollo}`],
      ['% de caramelización', `${af.porcentaje_caramelizacion} %`, 'C° Desarrollo', `${af.c_desarrollo}`],
    ];

    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin },
      body: fisico, theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: contentWidth * 0.28 },
        1: { cellWidth: contentWidth * 0.22 },
        2: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: contentWidth * 0.28 },
        3: { cellWidth: contentWidth * 0.22 },
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 4;

    if (af.comentario) {
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
      pdf.text('Comentario:', margin, y);
      pdf.setFont('helvetica', 'italic');
      const comentarioFisico = pdf.splitTextToSize(af.comentario, contentWidth);
      pdf.text(comentarioFisico, margin, y + 4);
      y += 4 + comentarioFisico.length * 4 + 4;
    }

    // ── 2.- ANÁLISIS DEFECTOS ──
    this.ui.showProgress('Agregando defectos...', 50);
    y += 2;
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('2.- Análisis Defectos', margin, y);
    y += 5;

    const halfWidth = (contentWidth - 6) / 2;
    const ad = this.analisisDefectos;
    const c = this.calc;

    const primarios = [
      ['Grano Negro', ad.grano_negro, c.grano_negro],
      ['Grano Agrio', ad.grano_agrio, c.grano_agrio],
      ['Grano con Hongos', ad.grano_con_hongos, c.grano_con_hongos],
      ['Cereza Seca', ad.cereza_seca, c.cereza_seca],
      ['Materia extraña', ad.materia_estrana, c.materia_estrana],
      ['Broca severa', ad.broca_severa, c.broca_severa],
    ];

    const secundarios = [
      ['Negro parcial', ad.negro_parcial, c.negro_parcial],
      ['Agrio parcial', ad.agrio_parcial, c.agrio_parcial],
      ['Pergamino', ad.pergamino, c.pergamino],
      ['Flotadores', ad.flotadores, c.flotadores],
      ['Inmaduro', ad.inmaduro, c.inmaduro],
      ['Averanado', ad.averanado, c.averanado],
      ['Conchas', ad.conchas, c.conchas],
      ['Cáscara pulpa seca', ad.cascara_pulpa_seca, c.cascara_pulpa_seca],
      ['Partido/mordido/cortado', ad.partido_mordido_cortado, c.partido_mordido_cortado],
      ['Broca Leva', ad.broca_leva, c.broca_leva],
    ];

    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin + halfWidth + 6, bottom: 32 },
      head: [['Defecto Primario', 'N°', 'Valor']],
      body: [...primarios, ['Valor Total', '', this.totalPrimarios]] as any,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.3 },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === primarios.length) data.cell.styles.fontStyle = 'bold';
      },
    });
    const primYEnd = (pdf as any).lastAutoTable.finalY;

    autoTable(pdf, {
      startY: y, margin: { left: margin + halfWidth + 6, right: margin, bottom: 32 },
      head: [['Defecto Secundario', 'N°', 'Valor']],
      body: [...secundarios, ['Valor Total', '', this.totalSecundarios]] as any,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.3 },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === secundarios.length) data.cell.styles.fontStyle = 'bold';
      },
    });
    const secYEnd = (pdf as any).lastAutoTable.finalY;
    y = Math.max(primYEnd, secYEnd) + 4;

    // ── 3.- ANÁLISIS SENSORIAL (nueva página) ──
    this.ui.showProgress('Agregando análisis sensorial...', 65);
    pdf.addPage();
    drawTopBar();
    y = margin;

    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('3.- Análisis Sensorial', margin, y);
    y += 5;

    const as = this.analisisSensorial;
    const sensorial = [
      ['Aroma / Fragancia', as.fragancia_aroma],
      ['Sabor', as.sabor],
      ['Sabor Residual', as.sabor_residual],
      ['Acidez', as.acidez],
      ['Cuerpo', as.cuerpo],
      ['Balance', as.balance],
      ['General', as.puntaje_catador],
      ['Uniformidad', as.uniformidad],
      ['Taza Limpia', as.taza_limpia],
      ['Dulzor', as.dulzor],
    ];

    const sensorialWidth = contentWidth * 0.48;
    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin + contentWidth - sensorialWidth },
      head: [['Métrica', 'Valor']],
      body: sensorial as any, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
    });
    const sensorialTableEndY = (pdf as any).lastAutoTable.finalY;

    const defectosCalc = [
      ['Defecto Leve', `${as.taza_defecto_ligero} x -2 = ${as.taza_defecto_ligero * -2}`],
      ['Defecto Grave', `${as.tazas_defecto_rechazo} x -4 = ${as.tazas_defecto_rechazo * -4}`],
      ['Puntaje Final', `${as.puntaje_taza}`],
    ];
    autoTable(pdf, {
      startY: y, margin: { left: margin + sensorialWidth + 4, right: margin },
      body: defectosCalc as any, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: (contentWidth - sensorialWidth - 4) * 0.4 },
        1: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.row.index === defectosCalc.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 9;
        }
      },
    });
    const calcTableEndY = (pdf as any).lastAutoTable.finalY;
    y = Math.max(sensorialTableEndY, calcTableEndY) + 5;

    if (as.comentario) {
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bolditalic');
      const textoComentario = this.notasPipe.transform(as.comentario);
      const comentarioSensorial = pdf.splitTextToSize(textoComentario, contentWidth);
      pdf.text(comentarioSensorial, margin, y);
      y += comentarioSensorial.length * 4 + 4;
    }

    // ── Gráficos ──
    this.ui.showProgress('Agregando gráficos...', 80);
    let spiderImg = '', pieImg = '';
    let spiderDim = { w: 0, h: 0 }, pieDim = { w: 0, h: 0 };
    if (this.spiderGraphComp) {
      try {
        spiderImg = await this.toJpeg(await this.spiderGraphComp.getChartImage());
        spiderDim = await this.getImgDimensions(spiderImg, 75, 75);
      } catch (e) {
        console.warn('No se pudo capturar el spider graph', e);
      }
    }
    if (this.multiPie?.getChartImage) {
      try {
        pieImg = await this.toJpeg(this.multiPie.getChartImage());
        pieDim = await this.getImgDimensions(pieImg, 75, 75);
      } catch (e) {
        console.warn('No se pudo capturar el multi-pie-chart', e);
      }
    }

    const graficosY = y;
    if (spiderImg) pdf.addImage(spiderImg, 'JPEG', margin + (sensorialWidth - spiderDim.w) / 2, graficosY, spiderDim.w, spiderDim.h);
    if (pieImg) pdf.addImage(pieImg, 'JPEG', margin + sensorialWidth + 4 + ((contentWidth - sensorialWidth - 4) - pieDim.w) / 2, graficosY, pieDim.w, pieDim.h);
    y = graficosY + Math.max(spiderDim.h, pieDim.h) + 10;

    // ── FIRMA ──
    this.ui.showProgress('Agregando firma...', 90);
    if (firma) {
      pdf.addImage(firma, 'JPEG', margin, y, dimFirma.w, dimFirma.h);
      y += dimFirma.h + 1;
    }
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, margin + 55, y);
    y += 4;
    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
    pdf.text('RENATO MARTINETTI', margin, y); y += 4;
    pdf.text('Q GRADER EVOLVED #Q-123819', margin, y); y += 4;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7);
    const fechaFirma = this.analisis?.fecha_registro
      ? new Date(this.analisis.fecha_registro).toLocaleDateString('es-PE') : '';
    pdf.text(`Fecha: ${fechaFirma}`, margin, y);
    y += 5;

    pdf.setFontSize(6.5); pdf.setFont('helvetica', 'italic');
    const disclaimer = `Este análisis se hizo para de muestra de café de los ${this.muestra.peso} gr. y es válido solo para esta misma`;
    pdf.text(pdf.splitTextToSize(disclaimer, contentWidth * 0.55), margin, y);

    // ── PIE DE PÁGINA ──
    this.ui.showProgress('Guardando archivo...', 95);
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFillColor(...brandRed);
      pdf.rect(0, pageHeight - 2.5, pageWidth, 2.5, 'F');
      pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 8, { align: 'right' });
      if (logoFinal) {
        pdf.addImage(logoFinal, 'JPEG', (pageWidth - dimFinal.w) / 2, pageHeight - margin - dimFinal.h - 6, dimFinal.w, dimFinal.h);
      }
    }

    await new Promise(r => setTimeout(r, 100));

    const nombreArchivo = (this.user.nombre_comercial ? this.user.nombre_comercial : this.user.nombre) || 'Reporte';
    pdf.save(`${nombreArchivo}_${this.muestra.id_muestra || this.id}.pdf`);

    this.ui.clearProgress();
    this.ui.alert('success', 'PDF generado', 'El reporte se descargó correctamente.');
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

  // Recomprime a JPEG con fondo blanco para que el PDF pese menos.
  private toJpeg(dataUri: string, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = dataUri;
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
}