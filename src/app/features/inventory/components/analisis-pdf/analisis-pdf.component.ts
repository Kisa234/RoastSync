import { AnalisisDefectos } from '../../../../shared/models/analisis-defectos';
import { Muestra } from '../../../../shared/models/muestra';
import { LoteService } from '../../service/lote.service';
import { AnalisisDefectosService } from '../../../analysis/service/analisis-defectos.service';
import { AnalisisService } from '../../../analysis/service/analisis.service';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnalisisFisico } from '../../../../shared/models/analisis-fisico';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';
import { MuestraService } from '../../service/muestra.service';
import { Analisis } from '../../../../shared/models/analisis';
import { AnalisisSensorialService } from '../../../analysis/service/analisis-sensorial.service';
import { AnalisisFisicoService } from '../../../analysis/service/analisis-fisico.service';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';
import { Lote } from '../../../../shared/models/lote';
import { CommonModule, NgIf } from '@angular/common';
import { SpiderGraphComponent } from '../spider-graph/spider-graph.component';
import { Download, LucideAngularModule } from 'lucide-angular';
import { NotasSensorialesPipe } from '../../../../shared/pipes/notas.pipe';
import { MultiPieChartComponent } from '../../../../shared/components/multi-pie-chart/multi-pie-chart.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import printJS from 'print-js';


@Component({
  selector: 'analisis-pdf',
  imports: [NgIf, CommonModule, SpiderGraphComponent, LucideAngularModule, NotasSensorialesPipe, MultiPieChartComponent],
  templateUrl: './analisis-pdf.component.html',
  styles: `
 
  
  `
})
export class AnalisisPdfComponent implements OnInit {
  @Input() id: string = '';
  @Input() type: string = '';
  readonly Download = Download;

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
    peso: 0,
    variedades: [],
    proceso: '',
    fecha_registro: new Date(),
    eliminado: false,
    productor: '',
    finca: '',
    region: '',
    departamento: ''
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



  constructor(
    private loteService: LoteService,
    private muestraService: MuestraService,
    private analisisService: AnalisisService,
    private analisisSensorialService: AnalisisSensorialService,
    private analisisFisicoService: AnalisisFisicoService,
    private analisisDefectosService: AnalisisDefectosService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    console.log('AnalisisPdfComponent initialized with id:', this.id, 'and type:', this.type);
    this.loadData();
  }

  private loadData(): void {
    let idAnalisis: string | undefined = '';
    let idUser: string | undefined = '';

    if (this.type === 'lote') {
      this.loteService.getById(this.id).subscribe(lote => {
        idAnalisis = lote.id_analisis;
        idUser = lote.id_user;
        this.lote = lote;

        // ——————————————————————————————————————————
        // A partir de aquí, idAnalisis e idUser ya tienen valor
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

        if (idUser) {
          this.userService.getUserById(idUser).subscribe(user => {
            this.user = user;
          });
        }
        // ——————————————————————————————————————————
      });
    }
    else if (this.type === 'muestra') {
      this.muestraService.getById(this.id).subscribe(muestra => {
        idAnalisis = muestra.id_analisis;
        idUser = muestra.id_user;
        this.muestra = muestra;

        // ——————————————————————————————————————————
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

        if (idUser) {
          this.userService.getUserById(idUser).subscribe(user => {
            this.user = user;
          });
        }
        // ——————————————————————————————————————————
      });
    }


  }


  get origen(): string {
    const fuente = this.type === 'lote' ? this.lote : this.muestra;
    if (!fuente) return '';
    const segmentos: string[] = [];
    if (fuente.departamento) segmentos.push(fuente.departamento);
    if (fuente.region) segmentos.push(fuente.region);
    if (fuente.finca) segmentos.push(fuente.finca);
    return segmentos.length ? segmentos.join(' - ') : '';
  }

  calcGrado() {
    // defectos primarios
    this.total += Math.floor(this.analisisDefectos.grano_negro! / 1);
    this.calc.grano_agrio = Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.total += Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.calc.grano_agrio = Math.floor(this.analisisDefectos.grano_agrio! / 1);
    this.total += Math.floor(this.analisisDefectos.grano_con_hongos! / 1);
    this.calc.grano_con_hongos = Math.floor(this.analisisDefectos.grano_con_hongos! / 1);
    this.total += Math.floor(this.analisisDefectos.cereza_seca! / 1);
    this.calc.cereza_seca = Math.floor(this.analisisDefectos.cereza_seca! / 1);
    this.total += Math.floor(this.analisisDefectos.materia_estrana! / 1);
    this.calc.materia_estrana = Math.floor(this.analisisDefectos.materia_estrana! / 1);
    this.total += Math.floor(this.analisisDefectos.broca_severa! / 5);
    this.calc.broca_severa = Math.floor(this.analisisDefectos.broca_severa! / 5);
    // defectos secundarios
    this.total += Math.floor(this.analisisDefectos.negro_parcial! / 3);
    this.calc.negro_parcial = Math.floor(this.analisisDefectos.negro_parcial! / 3);
    this.total += Math.floor(this.analisisDefectos.agrio_parcial! / 3);
    this.calc.agrio_parcial = Math.floor(this.analisisDefectos.agrio_parcial! / 3);
    this.total += Math.floor(this.analisisDefectos.pergamino! / 5);
    this.calc.pergamino = Math.floor(this.analisisDefectos.pergamino! / 5);
    this.total += Math.floor(this.analisisDefectos.flotadores! / 5);
    this.calc.flotadores = Math.floor(this.analisisDefectos.flotadores! / 5);
    this.total += Math.floor(this.analisisDefectos.inmaduro! / 5);
    this.calc.inmaduro = Math.floor(this.analisisDefectos.inmaduro! / 5);
    this.total += Math.floor(this.analisisDefectos.averanado! / 5);
    this.calc.averanado = Math.floor(this.analisisDefectos.averanado! / 5);
    this.total += Math.floor(this.analisisDefectos.conchas! / 5);
    this.calc.conchas = Math.floor(this.analisisDefectos.conchas! / 5);
    this.total += Math.floor(this.analisisDefectos.cascara_pulpa_seca! / 5);
    this.calc.cascara_pulpa_seca = Math.floor(this.analisisDefectos.cascara_pulpa_seca! / 5);
    this.total += Math.floor(this.analisisDefectos.partido_mordido_cortado! / 5);
    this.calc.partido_mordido_cortado = Math.floor(this.analisisDefectos.partido_mordido_cortado! / 5);
    this.total += Math.floor(this.analisisDefectos.broca_leva! / 10);
    this.calc.broca_leva = Math.floor(this.analisisDefectos.broca_leva! / 10);
  }

  getAssetUrl(nombre: string): string {
    return `${window.location.origin}/assets/img/${nombre}`;
  }

  @ViewChild(MultiPieChartComponent) multiPie!: MultiPieChartComponent;

  exportPdf(): void {
    const content = document.getElementById('pdfContent');
    if (!content) return;

    // 1. Saca la imagen completa del sunburst
    const dataUrl = this.multiPie.getChartImage();

    // 2. Clona el innerHTML y sustituye TODO el tag <multi-pie-chart>
    let html = content.innerHTML.replace(
      /<multi-pie-chart[\s\S]*?<\/multi-pie-chart>/,
      `<img src="${dataUrl}" style="width:100%; height:auto;" />`
    );

    // 3. Extrae tus estilos
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules || [])
            .map(r => r.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // 4. Abre la ventana de impresión
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte PDF</title>
          <style>${styles}</style>
        </head>
        <body class="bg-white text-black">
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();

    // 5. Dale tiempo a render y manda a imprimir
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  }


}
