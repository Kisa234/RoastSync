import { Muestra } from './../../../../shared/models/muestra';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Coffee, FlaskConical, Download } from 'lucide-angular';

import { LoteService } from '../../../inventory/service/lote.service';
import { AnalisisService } from '../../../analysis/service/analisis.service';
import { AnalisisSensorialService } from '../../../analysis/service/analisis-sensorial.service';
import { AnalisisFisicoService } from '../../../analysis/service/analisis-fisico.service';
import { UiService } from '../../../../shared/services/ui.service';

import { Lote } from '../../../../shared/models/lote';
import { Analisis } from '../../../../shared/models/analisis';
import { AnalisisSensorial } from '../../../../shared/models/analisis-sensorial';
import { AnalisisFisico } from '../../../../shared/models/analisis-fisico';

import { tap, switchMap } from 'rxjs/operators';
import { MuestraService } from '../../service/muestra.service';
import { AnalisisDefectos } from '../../../../shared/models/analisis-defectos';
import { AnalisisDefectosService } from '../../../analysis/service/analisis-defectos.service';
import { SpiderGraphComponent } from "../spider-graph/spider-graph.component";
import { PdfComponent } from '../pdf/pdf.component';
import { ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'report-lote',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NgIf, NgFor, SpiderGraphComponent, PdfComponent, RouterLink],
  templateUrl: './report-lote.component.html'
})
export class ReportLoteComponent implements OnInit {
  @Input() loteId?: string;
  @Input() MuestraId?: string
  @Output() close = new EventEmitter<void>();
  @ViewChild('pdfChild') pdfChild!: PdfComponent;

  readonly X = X;
  readonly Coffee = Coffee;
  readonly FlaskConical = FlaskConical;
  readonly Download = Download;
  activeTab: 'sensorial' | 'fisico' = 'sensorial';

  muestra: Muestra = {
    id_muestra: '',
    productor: '',
    finca: '',
    region: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    fecha_registro: new Date(),
    eliminado: false
  }

  lote: Lote = {
    id_lote: '',
    productor: '',
    finca: '',
    region: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  }

  analisis!: Analisis;
  as: AnalisisSensorial = {
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

  af: AnalisisFisico = {
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
    comentario: '',
  }

  ad: AnalisisDefectos = {
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

  /** Para buclear atributos sensoriales en la vista */
  analisisSensorialFields = [
    { label: 'Fragancia/Aroma', value: () => this.as.fragancia_aroma },
    { label: 'Sabor', value: () => this.as.sabor },
    { label: 'Sabor Residual', value: () => this.as.sabor_residual },
    { label: 'Acidez', value: () => this.as.acidez },
    { label: 'Cuerpo', value: () => this.as.cuerpo },
    { label: 'Uniformidad', value: () => this.as.uniformidad },
    { label: 'Balance', value: () => this.as.balance },
    { label: 'Taza Limpia', value: () => this.as.taza_limpia },
    { label: 'Dulzor', value: () => this.as.dulzor },
    { label: 'Puntaje Catador', value: () => this.as.puntaje_catador }
  ];

  id: string = '';
  type: string = '';

  constructor(
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private analisisSvc: AnalisisService,
    private afSvc: AnalisisFisicoService,
    private asSvc: AnalisisSensorialService,
    private adSvc: AnalisisDefectosService,
    private ui: UiService
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  selectTab(tab: 'sensorial' | 'fisico') {
    this.activeTab = tab;
  }

  onClose() {
    this.close.emit();
  }

  private fetchData() {
    if (this.loteId) {
      this.id = this.loteId;
      this.type = 'lote';
    } else {
      this.id = this.MuestraId!;
      this.type = 'muestra';
    }
    if (this.loteId) {
      this.loteSvc.getById(this.loteId).pipe(
        tap(l => this.lote = l),
        switchMap(l => this.analisisSvc.getAnalisisById(l.id_analisis!)),
        tap(a => this.analisis = a),
        switchMap(a => this.afSvc.getAnalisisById(a.analisisFisico_id!)),
        tap(f => this.af = f),
        switchMap(() => this.asSvc.getAnalisisById(this.analisis.analisisSensorial_id!)),
        tap(s => this.as = s),
        switchMap(() => this.adSvc.getAnalisisById(this.analisis.analisisDefectos_id!)),
        tap(ad => this.ad = ad)
      ).subscribe({
        error: () => this.ui.alert('error', 'Error', 'No se pudo cargar el reporte')
      });
    } else {
      this.muestraSvc.getById(this.MuestraId!).pipe(
        tap(m => this.muestra = m),
        switchMap(m => this.analisisSvc.getAnalisisById(m.id_analisis!)),
        tap(a => this.analisis = a),
        switchMap(a => this.afSvc.getAnalisisById(a.analisisFisico_id!)),
        tap(f => this.af = f),
        switchMap(() => this.asSvc.getAnalisisById(this.analisis.analisisSensorial_id!)),
        tap(s => this.as = s),
        switchMap(() => this.adSvc.getAnalisisById(this.analisis.analisisDefectos_id!)),
        tap(ad => this.ad = ad)
      ).subscribe({
        error: () => this.ui.alert('error', 'Error', 'No se pudo cargar el reporte')
      });
    }
  }
}

