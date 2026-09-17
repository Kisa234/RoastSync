import { CommonModule, NgIf } from '@angular/common';
import { SpiderGraphComponent } from '../../../../../shared/components/spider-graph/spider-graph.component';
import { Download, ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { NotasSensorialesPipe } from '../../../../../shared/pipes/notas.pipe';
import { MultiPieChartComponent } from '../../../../../shared/components/multi-pie-chart/multi-pie-chart.component';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Lote } from '../../../../../shared/models/lote';
import { Muestra } from '../../../../../shared/models/muestra';
import { AnalisisFisico } from '../../../../../shared/models/analisis-fisico';
import { LoteService } from '../../service/lote.service';
import { MuestraService } from '../../../muestras/service/muestra.service';
import { AnalisisService } from '../../../../analysis/service/analisis.service';
import { AnalisisSensorialService } from '../../../../analysis/service/analisis-sensorial.service';
import { AnalisisFisicoService } from '../../../../analysis/service/analisis-fisico.service';
import { AnalisisDefectosService } from '../../../../analysis/service/analisis-defectos.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { Analisis } from '../../../../../shared/models/analisis';
import { AnalisisDefectos } from '../../../../../shared/models/analisis-defectos';
import { AnalisisSensorial } from '../../../../../shared/models/analisis-sensorial';
import { User } from '../../../../../shared/models/user';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'report-lote',
  imports: [NgIf, CommonModule, SpiderGraphComponent, LucideAngularModule, NotasSensorialesPipe, MultiPieChartComponent],
  templateUrl: './report-lote.component.html',
  styles: ` `
})
export class ReportLoteComponent implements OnInit {
  @Input() id: string = '';
  @Input() type: string = '';
  readonly Download = Download;
  readonly ArrowLeft = ArrowLeft;

  // Referencia directa a los componentes de gráficos, para pedirles su
  // propia imagen exportada al generar el PDF (en vez de intentar
  // "fotografiar" el DOM con html2canvas, que fallaba en silencio con
  // el SVG de ApexCharts).
  @ViewChild(SpiderGraphComponent) spiderGraphComp!: SpiderGraphComponent;
  @ViewChild(MultiPieChartComponent) multiPie!: MultiPieChartComponent;

  lote: Lote = {
    id_lote: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  }

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
  }

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
  }

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
  }

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
  }

  calc: Partial<AnalisisDefectos> = {
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
  }

  analisis: Analisis = {
    id_analisis: '',
    fecha_registro: new Date(),
    analisisFisico_id: '',
    analisisSensorial_id: '',
    analisisDefectos_id: '',
    comentario: '',
  }

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

  total: number = 0;
  totalPrimarios: number = 0;
  totalSecundarios: number = 0;



  constructor(
    private loteService: LoteService,
    private muestraService: MuestraService,
    private analisisService: AnalisisService,
    private analisisSensorialService: AnalisisSensorialService,
    private analisisFisicoService: AnalisisFisicoService,
    private analisisDefectosService: AnalisisDefectosService,
    private userService: UserService,
    private ui: UiService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.id = this.id || this.route.snapshot.paramMap.get('id') || '';
    this.type = this.type || 'lote';
    console.log('[ReportLote] init con id=', this.id, 'type=', this.type);
    this.loadData();
  }

  // Botón "Volver" del breadcrumb — regresa a donde sea que vino el
  // usuario, en vez de navegar a una ruta fija (mismo patrón que el
  // resto de páginas de la app, ver frontendguia.md sección 3).
  goBack(): void {
    this.location.back();
  }


  private loadData(): void {
    console.log('[ReportLote] loadData() arrancó, type=', this.type, 'id=', this.id);
    let idAnalisis: string | undefined = '';
    let idUser: string | undefined = '';

    if (this.type === 'lote') {
      console.log('[ReportLote] entrando a rama lote, pidiendo loteService.getById', this.id);
      this.loteService.getById(this.id).subscribe({
        next: lote => {
          console.log('[ReportLote] lote recibido:', lote);
          idAnalisis = lote.id_analisis;
          idUser = lote.id_user;
          this.lote = lote;

          if (idAnalisis) {
            this.analisisService.getAnalisisById(idAnalisis).subscribe({
              next: analisis => {
                console.log('[ReportLote] analisis recibido:', analisis);
                this.analisis = analisis;
                this.analisisFisicoService.getAnalisisById(analisis.analisisFisico_id!).subscribe({
                  next: f => { console.log('[ReportLote] fisico:', f); this.analisisFisico = f; },
                  error: e => console.error('[ReportLote] ERROR fisico', e),
                });
                this.analisisSensorialService.getAnalisisById(analisis.analisisSensorial_id!).subscribe({
                  next: s => { console.log('[ReportLote] sensorial:', s); this.analisisSensorial = s; },
                  error: e => console.error('[ReportLote] ERROR sensorial', e),
                });
                this.analisisDefectosService.getAnalisisById(analisis.analisisDefectos_id!).subscribe({
                  next: d => {
                    console.log('[ReportLote] defectos:', d);
                    this.analisisDefectos = d;
                    this.calcGrado();
                  },
                  error: e => console.error('[ReportLote] ERROR defectos', e),
                });
              },
              error: e => console.error('[ReportLote] ERROR analisis', e),
            });
          } else {
            console.warn('[ReportLote] el lote no tiene id_analisis!');
          }

          if (lote.owned_by_store) {
            this.user = { ...this.user, nombre: 'FORTUNATO' };
          } else if (idUser) {
            this.userService.getUserById(idUser).subscribe({
              next: user => { console.log('[ReportLote] user:', user); this.user = user; },
              error: e => console.error('[ReportLote] ERROR user', e),
            });
          }
        },
        error: e => console.error('[ReportLote] ERROR loteService.getById', e),
      });
    }
    else if (this.type === 'muestra') {
      this.muestraService.getById(this.id).subscribe(muestra => {
        idAnalisis = muestra.id_analisis;
        idUser = muestra.id_user;
        this.muestra = muestra;

        if (idAnalisis) {
          this.analisisService.getAnalisisById(idAnalisis).subscribe(analisis => {
            this.analisis = analisis;
            this.analisisFisicoService
              .getAnalisisById(analisis.analisisFisico_id!)
              .subscribe(f => this.analisisFisico = f);
            this.analisisSensorialService
              .getAnalisisById(analisis.analisisSensorial_id!)
              .subscribe(s => this.analisisSensorial = s);
            this.analisisDefectosService
              .getAnalisisById(analisis.analisisDefectos_id!)
              .subscribe(d => {
                this.analisisDefectos = d;
                this.calcGrado();
              });
          });
        }

        if (muestra.owned_by_store) {
          this.user = { ...this.user, nombre: 'FORTUNATO' };
        } else if (idUser) {
          this.userService.getUserById(idUser).subscribe(user => {
            this.user = user;
          });
        }
      });
    }
    else {
      console.error('[ReportLote] type inválido/no seteado, no se ejecuta ninguna rama:', this.type);
    }
  }

  private notasPipe = new NotasSensorialesPipe();

  get origen(): string {
    const fuente = this.type === 'lote' ? this.lote : this.muestra;
    if (!fuente) return '';
    const segmentos: string[] = [];
    if (fuente.departamento) segmentos.push(fuente.departamento);
    if (fuente.distrito) segmentos.push(fuente.distrito);
    if (fuente.finca) segmentos.push(fuente.finca);
    return segmentos.length ? segmentos.join(' - ') : '';
  }

  calcGrado() {
    // defectos primarios
    this.total += Math.floor(this.analisisDefectos.grano_negro! / 1);
    this.totalPrimarios += Math.floor(this.analisisDefectos.grano_negro! / 1);
    this.calc.grano_agrio = Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.total += Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.totalPrimarios += Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.calc.grano_agrio = Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.total += Math.floor(this.analisisDefectos.grano_con_hongos! / 1);
    this.totalPrimarios += Math.floor(this.analisisDefectos.grano_con_hongos! / 1);
    this.calc.grano_con_hongos = Math.floor(this.analisisDefectos.grano_con_hongos! / 1);
    this.total += Math.floor(this.analisisDefectos.cereza_seca! / 1);
    this.totalPrimarios += Math.floor(this.analisisDefectos.cereza_seca! / 1);
    this.calc.cereza_seca = Math.floor(this.analisisDefectos.cereza_seca! / 1);
    this.total += Math.floor(this.analisisDefectos.materia_estrana! / 1);
    this.totalPrimarios += Math.floor(this.analisisDefectos.materia_estrana! / 1);
    this.calc.materia_estrana = Math.floor(this.analisisDefectos.materia_estrana! / 1);
    this.total += Math.floor(this.analisisDefectos.broca_severa! / 5);
    this.totalPrimarios += Math.floor(this.analisisDefectos.broca_severa! / 5);
    this.calc.broca_severa = Math.floor(this.analisisDefectos.broca_severa! / 5);
    // defectos secundarios
    this.total += Math.floor(this.analisisDefectos.negro_parcial! / 3);
    this.totalSecundarios += Math.floor(this.analisisDefectos.negro_parcial! / 3);
    this.calc.negro_parcial = Math.floor(this.analisisDefectos.negro_parcial! / 3);
    this.total += Math.floor(this.analisisDefectos.agrio_parcial! / 3);
    this.totalSecundarios += Math.floor(this.analisisDefectos.agrio_parcial! / 3);
    this.calc.agrio_parcial = Math.floor(this.analisisDefectos.agrio_parcial! / 3);
    this.total += Math.floor(this.analisisDefectos.pergamino! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.pergamino! / 5);
    this.calc.pergamino = Math.floor(this.analisisDefectos.pergamino! / 5);
    this.total += Math.floor(this.analisisDefectos.flotadores! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.flotadores! / 5);
    this.calc.flotadores = Math.floor(this.analisisDefectos.flotadores! / 5);
    this.total += Math.floor(this.analisisDefectos.inmaduro! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.inmaduro! / 5);
    this.calc.inmaduro = Math.floor(this.analisisDefectos.inmaduro! / 5);
    this.total += Math.floor(this.analisisDefectos.averanado! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.averanado! / 5);
    this.calc.averanado = Math.floor(this.analisisDefectos.averanado! / 5);
    this.total += Math.floor(this.analisisDefectos.conchas! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.conchas! / 5);
    this.calc.conchas = Math.floor(this.analisisDefectos.conchas! / 5);
    this.total += Math.floor(this.analisisDefectos.cascara_pulpa_seca! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.cascara_pulpa_seca! / 5);
    this.calc.cascara_pulpa_seca = Math.floor(this.analisisDefectos.cascara_pulpa_seca! / 5);
    this.total += Math.floor(this.analisisDefectos.partido_mordido_cortado! / 5);
    this.totalSecundarios += Math.floor(this.analisisDefectos.partido_mordido_cortado! / 5);
    this.calc.partido_mordido_cortado = Math.floor(this.analisisDefectos.partido_mordido_cortado! / 5);
    this.total += Math.floor(this.analisisDefectos.broca_leva! / 10);
    this.totalSecundarios += Math.floor(this.analisisDefectos.broca_leva! / 10);
    this.calc.broca_leva = Math.floor(this.analisisDefectos.broca_leva! / 10);
  }

  getAssetUrl(nombre: string): string {
    return `/assets/img/${nombre}`;
  }

  getPorcentage(valor: number, total: number): string {
    if (total === 0) return '0%';
    const porcentaje = (valor / total) * 100;
    return `${porcentaje.toFixed(1)}%`;
  }

  // ── EXPORTAR PDF: directo con jsPDF, un click, sin window.print() ──
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

    // ── LOGOS ──
    // Guarda estos archivos en src/assets/img/ con estos nombres exactos.
    this.ui.showProgress('Cargando logos...', 10);
    let logoIzq = '', logoDer = '', logoFinal = '';
    let dimIzq = { w: 0, h: 0 }, dimDer = { w: 0, h: 0 }, dimFinal = { w: 0, h: 0 };
    let firma = '';
    let dimFirma = { w: 0, h: 0 };
    try {
      // Los logos venían como PNG sin pérdida — eso es lo que más pesaba
      // el PDF. this.toJpeg() los recomprime con fondo blanco y calidad
      // 0.85, que para logos/firma es visualmente idéntico y pesa una
      // fracción.
      logoIzq = await this.toJpeg(await this.imageToBase64('assets/img/lo-buenos-negro.png'));
      logoDer = await this.toJpeg(await this.imageToBase64('assets/img/fortunato-logo.png'));
      logoFinal = await this.toJpeg(await this.imageToBase64('assets/img/logo-negro.png'));
      // Los logos seguían viéndose chicos con 42x22/50x14 — se agrandan
      // bastante más (mantienen su proporción real, getImgDimensions solo
      // los ajusta dentro de esta caja máxima, no los deforma).
      dimIzq = await this.getImgDimensions(logoIzq, 58, 32);
      dimDer = await this.getImgDimensions(logoDer, 65, 22);
      // "logo-negro.png" parece ser un wordmark ancho (no un ícono
      // cuadrado) — con una caja 16x16 el ancho lo forzaba a quedar bajito.
      // Le damos más ancho disponible.
      dimFinal = await this.getImgDimensions(logoFinal, 40, 16);
      firma = await this.toJpeg(await this.imageToBase64(this.getAssetUrl('firma-renato.png')));
      dimFirma = await this.getImgDimensions(firma, 35, 16);
    } catch (e) {
      console.warn('Logos/firma no cargados', e);
    }

    drawTopBar();

    this.ui.showProgress('Construyendo encabezado...', 20);
    // Antes: logoH fijo en 14 → si logoIzq salía más alto, se recortaba
    // visualmente al centrarlo. Ahora toma el más alto de los dos logos.
    const logoH = Math.max(dimIzq.h, dimDer.h, 14);
    if (logoIzq) pdf.addImage(logoIzq, 'JPEG', margin, margin + (logoH - dimIzq.h) / 2, dimIzq.w, dimIzq.h);
    if (logoDer) pdf.addImage(logoDer, 'JPEG', pageWidth - margin - dimDer.w, margin + (logoH - dimDer.h) / 2, dimDer.w, dimDer.h);

    let y = margin + logoH + 6;
    pdf.setDrawColor(...brandRed);
    pdf.setLineWidth(0.4);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
    // Antes el texto arrancaba pegado a la línea (y sin espacio extra).
    // Le damos un respiro antes de dibujar los cuadros de info.
    y += 4;

    const esLote = this.type === 'lote';
    const fuente = esLote ? this.lote : this.muestra;

    // Faltaba un título de página como el que sí tiene report-lote-tostado
    // ("Reporte Lote Tostado") — antes se iba directo de la línea roja a
    // la tabla de "Matriz de Lote...", sin decir qué reporte es.
    pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
    pdf.text(`Reporte de Analisis`, margin, y + 6);
    y += 14;

    const camposHeader: [string, string][] = [
      [esLote ? 'Matriz de Lote' : 'Matriz de Muestra', esLote ? this.lote.id_lote : this.muestra.id_muestra],
      ['Cliente', this.user.nombre],
      ['Productor', fuente.productor || 'N/A'],
    ];
    if (this.origen) camposHeader.push(['Origen', this.origen]);
    camposHeader.push(['Variedad', (fuente.variedades || []).join(', ')]);
    camposHeader.push(['Proceso', fuente.proceso || 'N/A']);

    // Antes: texto suelto en una fila, sin ninguna separación visual entre
    // campos. Ahora: una tabla de 2 filas (etiqueta arriba, valor abajo)
    // con bordes — cada campo queda en su propio "cuadro" correlacionado,
    // en vez de todo el texto flotando junto.
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      body: [
        camposHeader.map(([label]) => label),
        camposHeader.map(([, value]) => value || 'N/A'),
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.textColor = [80, 80, 80];
        }
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 8;

    // ── 1.- ANÁLISIS FÍSICO ──
    this.ui.showProgress('Agregando análisis físico...', 35);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('1.- Análisis Físico', margin, y);
    y += 5;

    const fisico = [
      ['Peso de la muestra', `${this.analisisFisico.peso_muestra} gr`, 'Peso pergamino', `${this.analisisFisico.peso_pergamino} gr`],
      ['WA', `${this.analisisFisico.wa}`, 'Temperatura WA', `${this.analisisFisico.temperatura_wa} °C`],
      ['Humedad', `${this.analisisFisico.humedad} %`, 'Temperatura Humedad', `${this.analisisFisico.temperatura_humedad} °C`],
      ['Densidad', `${this.analisisFisico.densidad}`, 'Color de grano en verde', this.analisisFisico.color_grano_verde],
      ['Olor', this.analisisFisico.olor, '', ''],
      ['Superior a malla 18', `${this.analisisFisico.superior_malla_18} gr | ${this.getPorcentage(this.analisisFisico.superior_malla_18, this.analisisFisico.peso_muestra)}`, 'Superior a malla 16', `${this.analisisFisico.superior_malla_16} gr | ${this.getPorcentage(this.analisisFisico.superior_malla_16, this.analisisFisico.peso_muestra)}`],
      ['Superior a malla 14', `${this.analisisFisico.superior_malla_14} gr | ${this.getPorcentage(this.analisisFisico.superior_malla_14, this.analisisFisico.peso_muestra)}`, 'Menor a malla 14', `${this.analisisFisico.menor_malla_14} gr | ${this.getPorcentage(this.analisisFisico.menor_malla_14, this.analisisFisico.peso_muestra)}`],
      ['Peso de defectos', `${this.analisisFisico.peso_defectos} gr`, 'Quáquers', `${this.analisisFisico.quaquers}`],
      ['Peso de muestra tostada', `${this.analisisFisico.peso_muestra_tostada}`, 'Desarrollo', `${this.analisisFisico.desarrollo}`],
      ['% de caramelización', `${this.analisisFisico.porcentaje_caramelizacion} %`, 'C° Desarrollo', `${this.analisisFisico.c_desarrollo}`],
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

    if (this.analisisFisico.comentario) {
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
      pdf.text('Comentario:', margin, y);
      pdf.setFont('helvetica', 'italic');
      const comentarioFisico = pdf.splitTextToSize(this.analisisFisico.comentario, contentWidth);
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

    const primarios = [
      ['Grano Negro', this.analisisDefectos.grano_negro, this.calc.grano_negro],
      ['Grano Agrio', this.analisisDefectos.grano_agrio, this.calc.grano_agrio],
      ['Grano con Hongos', this.analisisDefectos.grano_con_hongos, this.calc.grano_con_hongos],
      ['Cereza Seca', this.analisisDefectos.cereza_seca, this.calc.cereza_seca],
      ['Materia extraña', this.analisisDefectos.materia_estrana, this.calc.materia_estrana],
      ['Broca severa', this.analisisDefectos.broca_severa, this.calc.broca_severa],
    ];

    const secundarios = [
      ['Negro parcial', this.analisisDefectos.negro_parcial, this.calc.negro_parcial],
      ['Agrio parcial', this.analisisDefectos.agrio_parcial, this.calc.agrio_parcial],
      ['Pergamino', this.analisisDefectos.pergamino, this.calc.pergamino],
      ['Flotadores', this.analisisDefectos.flotadores, this.calc.flotadores],
      ['Inmaduro', this.analisisDefectos.inmaduro, this.calc.inmaduro],
      ['Averanado', this.analisisDefectos.averanado, this.calc.averanado],
      ['Conchas', this.analisisDefectos.conchas, this.calc.conchas],
      ['Cáscara pulpa seca', this.analisisDefectos.cascara_pulpa_seca, this.calc.cascara_pulpa_seca],
      ['Partido/mordido/cortado', this.analisisDefectos.partido_mordido_cortado, this.calc.partido_mordido_cortado],
      ['Broca Leva', this.analisisDefectos.broca_leva, this.calc.broca_leva],
    ];

    autoTable(pdf, {
      startY: y, margin: { left: margin, right: margin + halfWidth + 6 },
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
      startY: y, margin: { left: margin + halfWidth + 6, right: margin },
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
    // El "Grado: ..." ya no debe aparecer en el reporte — se quitó el
    // bloque que lo imprimía.

    // ── 3.- ANÁLISIS SENSORIAL (nueva página) ──
    this.ui.showProgress('Agregando análisis sensorial...', 65);
    pdf.addPage();
    drawTopBar();
    y = margin;

    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text('3.- Análisis Sensorial', margin, y);
    y += 5;

    const sensorial = [
      ['Aroma / Fragancia', this.analisisSensorial.fragancia_aroma],
      ['Sabor', this.analisisSensorial.sabor],
      ['Sabor Residual', this.analisisSensorial.sabor_residual],
      ['Acidez', this.analisisSensorial.acidez],
      ['Cuerpo', this.analisisSensorial.cuerpo],
      ['Balance', this.analisisSensorial.balance],
      ['General', this.analisisSensorial.puntaje_catador],
      ['Uniformidad', this.analisisSensorial.uniformidad],
      ['Taza Limpia', this.analisisSensorial.taza_limpia],
      ['Dulzor', this.analisisSensorial.dulzor],
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
      ['Defecto Leve', `${this.analisisSensorial.taza_defecto_ligero} x -2 = ${this.analisisSensorial.taza_defecto_ligero * -2}`],
      ['Defecto Grave', `${this.analisisSensorial.tazas_defecto_rechazo} x -4 = ${this.analisisSensorial.tazas_defecto_rechazo * -4}`],
      ['Puntaje Final', `${this.analisisSensorial.puntaje_taza}`],
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

    if (this.analisisSensorial.comentario) {
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bolditalic');
      const textoComentario = this.notasPipe.transform(this.analisisSensorial.comentario);
      const comentarioSensorial = pdf.splitTextToSize(textoComentario, contentWidth);
      pdf.text(comentarioSensorial, margin, y);
      y += comentarioSensorial.length * 4 + 4;
    }

    // ── Gráficos: spider graph + multi-pie-chart, ambos vía su propio
    // getChartImage() (ApexCharts.dataURI() / ECharts.getDataURL()) ──
    this.ui.showProgress('Agregando gráficos...', 80);
    let spiderImg = '', pieImg = '';
    let spiderDim = { w: 0, h: 0 }, pieDim = { w: 0, h: 0 };
    if (this.spiderGraphComp) {
      try {
        // ApexCharts/ECharts exportan PNG sin pérdida por defecto — con
        // pixelRatio 2 en el sunburst eso son 4x los píxeles, todos sin
        // comprimir. this.toJpeg() los pasa a JPEG con fondo blanco antes
        // de meterlos al PDF.
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
    // Antes: se forzaba la firma casi al fondo de la página
    // (pageHeight - margin - 22) sin importar dónde terminaban los
    // gráficos, dejando un hueco enorme en blanco entre ellos y la firma.
    // Ahora la firma va justo debajo de los gráficos, con un margen fijo,
    // así "sube" en vez de quedar pegada al fondo.
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

    // Antes: el disclaimer vivía anclado al fondo de la página, en su
    // propia esquina, sin relación visual con la firma. Ahora va justo
    // debajo del bloque de firma, como una nota a pie de la firma misma.
    pdf.setFontSize(6.5); pdf.setFont('helvetica', 'italic');
    const disclaimer = `Este análisis se hizo para de muestra de café de los ${esLote ? this.lote.peso : this.muestra.peso} gr. y es válido solo para esta misma`;
    const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth * 0.55);
    pdf.text(disclaimerLines, margin, y);

    // ── PIE DE PÁGINA (barra roja + número + logo triángulo, en todas las páginas) ──
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
    pdf.save(`${nombreArchivo}_${this.id}.pdf`);

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

  // Recomprime cualquier imagen (logo, firma o el PNG que exportan
  // ApexCharts/ECharts) como JPEG con fondo blanco. PNG es sin pérdida,
  // así que cada imagen del PDF pesaba varias veces más de lo necesario
  // para algo que no es un ícono con transparencia real — con calidad
  // 0.85 no se nota diferencia visual y el archivo final pesa una
  // fracción de lo que pesaba antes.
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