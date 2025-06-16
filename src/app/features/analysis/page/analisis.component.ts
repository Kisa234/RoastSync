import { AnalisisFisico } from './../../../shared/models/analisis-fisico';
// src/app/features/analysis/page/analisis.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiService, ConfirmOptions } from '../../../shared/services/ui.service';
import { AddAnalisisFisico } from '../components/add-analisis-fisico/add-analisis-fisico.component';
import { AddAnalisisSensorial } from '../components/add-analisis-sensorial/add-analisis-sensorial.component';
import { AddAnalisisRapido } from '../components/add-analisis-rapido/add-analisis-rapido.component';
import { MuestraService } from '../../inventory/service/muestra.service';
import { LoteTostadoService } from '../../inventory/service/lote-tostado.service';
import { LoteService } from '../../inventory/service/lote.service';
import { Lote } from '../../../shared/models/lote';
import { Muestra } from '../../../shared/models/muestra';
import { LoteTostado } from '../../../shared/models/lote-tostado';
import { LucideAngularModule, X, } from 'lucide-angular';
import { AnalisisService } from '../service/analisis.service';
import { lastValueFrom } from 'rxjs';
import { AnalisisFisicoService } from '../service/analisis-fisico.service';
import { AnalisisSensorialService } from '../service/analisis-sensorial.service';

@Component({
  selector: 'analisis-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAnalisisFisico,
    AddAnalisisSensorial,
    AddAnalisisRapido,
    LucideAngularModule
  ],
  templateUrl: './analisis.component.html',
})
export class AnalisisPage implements OnInit {
  // icons
  readonly X = X;

  lotes: Lote[] = [];
  muestras: Muestra[] = [];
  tostados: LoteTostado[] = [];

  // Tipos de target y selección
  targetTypes = ['Lote', 'Muestra', 'Café Tostado'];
  selectedTargetType = this.targetTypes[0];
  selectedLot = '';

  // Modo Crear / Editar
  selectedMode = 'Crear';

  // Pestañas de análisis
  tabs = ['fisico', 'sensorial', 'rapido'];
  selectedTab = 'fisico';

  // Control de modal
  showModal = false;

  // Histórico de operaciones
  history: Array<{
    targetId: string;
    targetType: string;
    analysisType: string;
    mode: string;
  }> = [];

  // Etiquetas para pestañas
  tabLabels: Record<string, string> = {
    fisico: 'Fisico',
    sensorial: 'Sensorial',
    rapido: 'Rápido'
  };

  constructor(
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private tostadoSvc: LoteTostadoService,
    private analisisSvc: AnalisisService,
    private analisisFisicoSvc: AnalisisFisicoService,
    private analisisSensorialSvc: AnalisisSensorialService,
    private ui: UiService,
  ) { }

  private readonly historyKey = 'ANALISIS_PAGE_HISTORY';


  ngOnInit() {
    this.loteSvc.getAll().subscribe(list => this.lotes = list);
    this.muestraSvc.getAll().subscribe(list => this.muestras = list);
    this.tostadoSvc.getAll().subscribe(list => this.tostados = list);
    this.loadHistory();
  }

  private loadHistory() {
    const stored = localStorage.getItem(this.historyKey);
    if (stored) {
      try {
        this.history = JSON.parse(stored);
      } catch {
        this.history = [];
      }
    }
  }

  private saveHistory() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
  }

  get selectLabel(): string {
    return `Seleccionar ${this.selectedTargetType}`;
  }

  get actionButtonLabel(): string {
    return `${this.selectedMode} Análisis ${this.tabLabels[this.selectedTab]}`;
  }

  onTargetTypeChange(type: string) {
    this.selectedTargetType = type;
    this.selectedTab = type === 'Café Tostado' ? 'rapido' : 'fisico';
    this.selectedMode = 'Crear';
  }

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }
  onModalSaved() {
    // añade al history según selectedTab y luego:
    switch (this.selectedTab) {
      case 'fisico': this.handleFisico(); break;
      case 'sensorial': this.handleSensorial(); break;
      case 'rapido': this.handleRapido(); break;
    }
    this.closeModal();
  }

  findTabByLabel(label: string): string {
    const entry = Object.entries(this.tabLabels).find(([, v]) => v === label);
    return entry ? entry[0] : 'fisico';
  }



  onSelectHistory(h: any) {
    this.selectedTargetType = h.targetType;
    this.selectedLot = h.targetId;
    this.selectedTab = this.findTabByLabel(h.analysisType);
    this.selectedMode = h.mode;
    // this.openModal();

    // primero cerramos…
    this.showModal = false;
    // y en el siguiente tick lo volvemos a abrir
    setTimeout(() => this.showModal = true, 0);
  }

  handleFisico() {
    this.history.push({
      targetId: this.selectedLot,
      targetType: this.selectedTargetType,
      analysisType: this.tabLabels['fisico'],
      mode: this.selectedMode
    });
    // this.closeModal();
  }

  handleSensorial() {
    this.history.push({
      targetId: this.selectedLot,
      targetType: this.selectedTargetType,
      analysisType: this.tabLabels['sensorial'],
      mode: this.selectedMode
    });
    // this.closeModal();
  }

  handleRapido() {
    this.history.push({
      targetId: this.selectedLot,
      targetType: this.selectedTargetType,
      analysisType: this.tabLabels['rapido'],
      mode: this.selectedMode
    });
    // this.closeModal();
  }

  async addAnalysis() {

    if (!this.selectedLot) {
      this.ui.alert('warning',
        'Falta selección',
        `Por favor selecciona un ${this.selectedTargetType} antes de agregar el análisis.`);
      return;
    }

    const tipo = this.selectedTargetType;
    const id = this.selectedLot;
    const modo = this.selectedMode;
    const analisisType = this.tabLabels[this.selectedTab];

    // 1) Comprobar duplicado en history
    if (this.history.some(h => h.targetType === tipo && h.targetId === id && h.analysisType === analisisType && h.mode === modo)) {
      this.ui.alert('info', 'Repetido', 'Este análisis ya está en tu historial.');
      return;
    }

    try {
      // 2) Obtengo el análisis existente (devuelve { analisisFisico_id?, analisisSensorial_id?, … })
      const a = await this.analisisSvc.getAnalisisByLoteId(id).toPromise();
      const tieneFisico = a!.analisisFisico_id ? true : false;
      const tieneSensorial = a!.analisisSensorial_id ? true : false;

      // 3a) Si hay físico pero NO sensorial → error y no agrego
      if (tieneFisico && !tieneSensorial && this.selectedTab === 'fisico') {
        this.ui.alert('error', 'Incompleto',
          `El lote ${id} tiene análisis físico pero no sensorial. Completa primero el sensorial.`);
        return;
      }
      // 3b) Si hay sensorial pero NO físico → sólo crear nuevo (caso sensorio o físico)
      if (!tieneFisico && tieneSensorial && this.selectedTab === 'sensorial') {
        this.ui.alert('error', 'Incompleto',
          `El lote ${id} tiene análisis sensorial pero no físico. Completa primero el físico.`);
        return;
      }
      // 3c) Si no hay ninguno → crear nuevo
      if (!tieneFisico && !tieneSensorial) {
        this.pushHistory();
        return;
      }
      // 3d) Si tiene ambos → preguntar editar o nuevo
      if (tieneFisico && tieneSensorial) {

        const opts = {
          title: 'Análisis existente',
          message: `El lote ${id} ya tiene ambos análisis. ¿Editar último o crear uno nuevo?`,
          confirmText: 'Editar',
          cancelText: 'Crear nuevo'
        };
        const editar = await this.ui.confirm(opts);
        if (editar) {
          this.selectedMode = 'Editar';
          this.pushHistory();
          return
        } else {
          this.selectedMode = 'Crear';
          this.pushHistory();
          return 
        }
      }
      // 4) Si llega hasta aquí, es porque no hay conflictos
      // y se puede agregar al historial
      this.selectedMode = 'Crear';
      this.pushHistory();
    } catch (e) {
      // si da error en GET, tratamos como “no hay análisis”
      this.pushHistory();
    }
  }

  /** Empuja la entrada al historial y abre el modal */
  private pushHistory() {
    this.history.push({
      targetId: this.selectedLot,
      targetType: this.selectedTargetType,
      analysisType: this.tabLabels[this.selectedTab],
      mode: this.selectedMode
    });
    this.saveHistory();
    this.showModal = true;
  }


  deleteHistory(idx: number, event: MouseEvent) {
    // 1) evita disparar onSelectHistory
    event.stopPropagation();

    const h = this.history[idx];
    const opts: ConfirmOptions = {
      title: 'Eliminar análisis',
      message: `¿Eliminar ${h.targetType} ${h.targetId} (${h.analysisType})?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    };

    this.ui.confirm(opts).then(ok => {
      if (!ok) return;

      // 2) elimina la clave asociada en localStorage
      const key = `${h.targetType.toUpperCase()}-${h.targetId}-${h.analysisType.toUpperCase()}-${h.mode.toUpperCase()}`;
      localStorage.removeItem(key);

      // 3) elimina del arreglo history
      this.history.splice(idx, 1);
      this.saveHistory();
      // 4) si el historial quedó vacío, cierra el modal
      if (this.history.length === 0) {
        this.closeModal();
      } else {
        // opcional: selecciona el primero restante
        const next = this.history[0];
        this.onSelectHistory(next);
      }
    });
  }

  /** Guarda todos los análisis físicos y sensoriales del historial */
  async saveAllPhysicalAndSensorial() {
    // Recorremos de atrás hacia adelante para poder splicear sin desalinear
    for (let i = this.history.length - 1; i >= 0; i--) {
      const h = this.history[i];

      // solo procesar físico y sensorial
      if (h.analysisType !== this.tabLabels['fisico'] &&
        h.analysisType !== this.tabLabels['sensorial']) {
        continue;
      }

      const id = h.targetId;
      const modo = h.mode; // 'Crear' o 'Editar'
      const tipo = h.analysisType.toUpperCase();
      const key = `${h.targetType.toUpperCase()}-${id}-${tipo}-${modo.toUpperCase()}`;

      try {
        const stored = localStorage.getItem(key);
        if (!stored) throw new Error(`No hay datos ${h.analysisType.toLowerCase()} para guardar`);

        const payload = JSON.parse(stored);

        if (h.analysisType === this.tabLabels['fisico']) {
          if (modo === 'Crear') {
            await lastValueFrom(this.analisisFisicoSvc.createAnalisis(payload, id));
          } else {
            await lastValueFrom(this.analisisFisicoSvc.updateAnalisis(id, payload));
          }
        } else { // sensorial
          if (modo === 'Crear') {
            await lastValueFrom(this.analisisSensorialSvc.createAnalisisSensorial(payload, id));
          } else {
            await lastValueFrom(this.analisisSensorialSvc.updateAnalisisSensorial(id, payload));
          }
        }

        // 1) eliminar del localStorage
        localStorage.removeItem(key);

        // 2) eliminar del history
        this.history.splice(i, 1);

      } catch (err: any) {
        this.ui.alert(
          'error',
          `Error guardando ${h.analysisType} de ${h.targetType} ${id}`,
          err.message || 'Fallo inesperado'
        );
        // continuar con el siguiente
      }
    }

    // notificación final
    this.ui.alert('success', 'Proceso completado', 'Se intentaron guardar todos los análisis físicos y sensoriales.');

    // 3) reabrir el modal para el primer elemento en history, si existe
    if (this.history.length) {
      // seleccionamos el primero y abrimos modal
      this.onSelectHistory(this.history[0]);
      this.openModal();
    }
  }

}


