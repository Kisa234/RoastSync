import { AnalisisDefectos } from './../../../../shared/models/analisis-defectos';
import { Muestra } from './../../../../shared/models/muestra';
import { LoteService } from './../../service/lote.service';
import { AnalisisDefectosService } from './../../../analysis/service/analisis-defectos.service';
import { AnalisisService } from './../../../analysis/service/analisis.service';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnalisisFisico } from '../../../../shared/models/analisis-fisico';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';
import { MuestraService } from '../../service/muestra.service';
import { Analisis } from '../../../../shared/models/analisis';
import { AnalisisSensorialService } from '../../../analysis/service/analisis-sensorial.service';
import { AnalisisFisicoService } from '../../../analysis/service/analisis-fisico.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';
import { Lote } from '../../../../shared/models/lote';
import { CommonModule, NgIf } from '@angular/common';
import { SpiderGraphComponent } from '../spider-graph/spider-graph.component';
import { Download, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pdf',
  imports: [NgIf, CommonModule, SpiderGraphComponent, LucideAngularModule],
  templateUrl: './pdf.component.html',
  styles: ``
})
export class PdfComponent implements OnInit {
  @Input() id: string = '';
  @Input() type: string = '';
  @ViewChild('pdfContent') pdfContent!: ElementRef<HTMLElement>;
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
              .subscribe(d => this.analisisDefectos = d);
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
              .subscribe(d => this.analisisDefectos = d);
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

  exportPdf(): void {
    const original = this.pdfContent.nativeElement;

    // 1) Clonar el elemento y fijar su ancho
    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.width = `${original.offsetWidth}px`;
    clone.style.boxSizing = 'border-box';

    // 2) Crear un contenedor off-screen
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '-10000px',
      width: clone.style.width
    });
    container.appendChild(clone);
    document.body.appendChild(container);

    // 3) Renderizar con html2canvas
    html2canvas(clone, {
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: original.scrollWidth,
      height: original.scrollHeight
    })
      .then(canvas => {
        // siempre limpiar el contenedor
        document.body.removeChild(container);

        // 4) Generar imagen en DataURL y preparar jsPDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        // altura proporcional de la imagen
        const imgH = (canvas.height * pageW) / canvas.width;
        let offsetY = 0;

        // 5) Agregar páginas mientras quede contenido
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
        while (imgH - offsetY > pageH) {
          offsetY += pageH;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -offsetY, pageW, imgH);
        }

        // 6) Descargar
        pdf.save(`analisis_${this.type}_${this.id}.pdf`);
      })
      .catch(err => {
        // limpiar en caso de error
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        console.error('Error al generar PDF', err);
      });
  }




}
