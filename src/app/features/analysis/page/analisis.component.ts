import { Muestra } from './../../../shared/models/muestra';
import { AnalisisFisico } from './../../../shared/models/analisis-fisico';
import { CommonModule, NgIf } from '@angular/common';
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
import { LoteTostado } from '../../../shared/models/lote-tostado';
import { LucideAngularModule, X } from 'lucide-angular';
import { AnalisisService } from '../service/analisis.service';
import { lastValueFrom } from 'rxjs';
import { AnalisisFisicoService } from '../service/analisis-fisico.service';
import { AnalisisSensorialService } from '../service/analisis-sensorial.service';
import { AnalisisRapidoService } from '../service/analisis-rapido.service';
import { AnalisisSensorial } from '../../../shared/models/analisis-sensorial';
import { AnalisisRapido } from '../../../shared/models/analisis-rapido';
import { Analisis } from '../../../shared/models/analisis';
import { UserService } from '../../users/service/users-service.service';
import { User } from '../../../shared/models/user';
import { AddAnalisisDefectos } from '../components/add-analisis-defectos/add-analisis-defectos.component';
import { AnalisisDefectos } from '../../../shared/models/analisis-defectos';
import { AnalisisDefectosService } from '../service/analisis-defectos.service';

@Component({
  selector: 'analisis-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAnalisisFisico,
    AddAnalisisSensorial,
    AddAnalisisRapido,
    AddAnalisisDefectos,
    LucideAngularModule,
    NgIf
  ],
  templateUrl: './analisis.component.html',
})
export class AnalisisPage implements OnInit {
  readonly X = X;

  lotesAll: Lote[] = [];
  lotes: Lote[] = [];
  muestras: Muestra[] = [];
  muestrasAll: Muestra[] = [];
  tostados: LoteTostado[] = [];
  clientes: User[] = [];


  targetTypes = ['Lote', 'Muestra', 'Café Tostado'];
  selectedTargetType = this.targetTypes[0];
  selectedLot = '';

  selectedMuest = '';
  muestraPicked: Muestra | null = null;

  selectedRoast = '';
  selectedClient = '';

  selectedMode: 'Crear' | 'Editar' = 'Crear';
  tabs = ['fisico', 'sensorial', 'rapido', 'defectos'];
  selectedTab = 'fisico';


  showModal = false;

  history: Array<{ targetType: string; targetId: string; analysisType: string; mode: string }> = [];
  private readonly historyKey = 'ANALISIS_PAGE_HISTORY';

  tabLabels: Record<string, string> = {
    fisico: 'Fisico',
    sensorial: 'Sensorial',
    defectos: 'Defectos',
    rapido: 'Rapido'
  };


  currentAnalysis: AnalisisDefectos | AnalisisFisico | AnalisisSensorial | AnalisisRapido | null = null;

  constructor(
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private tostadoSvc: LoteTostadoService,
    private analisisSvc: AnalisisService,
    private analisisFisicoSvc: AnalisisFisicoService,
    private analisisSensorialSvc: AnalisisSensorialService,
    private analisisRapidoSvc: AnalisisRapidoService,
    private analisisDefectosSvc: AnalisisDefectosService,
    private userSvc: UserService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.tostadoSvc.getAll().subscribe((list) => (this.tostados = list));
    this.loadUsersLote();
    this.loadHistory();
  }

  loadUsersLote() {
    this.userSvc.getUsers().subscribe(usuarios => {
      this.loteSvc.getAll().subscribe(lotes => {
        this.lotesAll = lotes;
        this.clientes = usuarios.filter(u =>
          lotes.some(l => l.id_user === u.id_user)
        );
      });
    });
  }

  loadUsersMuestra() {
    this.userSvc.getUsers().subscribe(usuarios => {
      this.muestraSvc.getAll().subscribe(muestra => {
        this.muestrasAll = muestra;
        this.muestras = this.muestrasAll;
        this.clientes = usuarios.filter(u => muestra.some(m => m.id_user === u.id_user));
      });
    });
  }

  onClientChange(id: string) {
    this.selectedClient = id;
    this.loteSvc.getAll().subscribe((list) => {
      this.lotes = list.filter(lote => lote.id_user === id);
      if (this.lotes.length > 0) {
        this.selectedLot = this.lotes[0].id_lote;
      } else {
        this.selectedLot = '';
      }
    });
    this.muestraSvc.getAll().subscribe((list) => {
      this.muestras = list.filter(muestra => muestra.id_user === id);
      if (this.muestras.length > 0) {
        this.selectedMuest = this.muestras[0].id_muestra;
      } else {
        this.selectedMuest = '';
      }
    });
    // this.tostadoSvc.getAll().subscribe((list) => {
    //   this.tostados = list.filter(tostado => tostado.id === id);
    //   if (this.tostados.length > 0) {
    //     this.selectedRoast = this.tostados[0].id_lote_tostado;
    //   } else {
    //     this.selectedRoast = '';
    //   }
    // });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
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
    this.selectedClient = '';
    this.selectedLot = '';
    this.muestraPicked = null;

    if (type === this.targetTypes[1]) {
      this.loadUsersMuestra();
    } else if (type === this.targetTypes[0]) {
      this.loadUsersLote();
    }
  }

  analysisStatus: { fisico: boolean | null; sensorial: boolean | null; defectos: boolean | null; rapido: boolean | null } = {
    fisico: null, sensorial: null, defectos: null, rapido: null
  };

  ColourEmptyTypeAnalisis(): void {
    // reset
    this.analysisStatus = { fisico: null, sensorial: null, defectos: null, rapido: null };

    const id = this.selectedLot;
    if (!id) return;

    if (this.selectedTargetType === 'Lote') {
      this.analisisSvc.getAnalisisByLoteId(id).subscribe({
        next: (a) => {
          this.analysisStatus.fisico = !!a?.analisisFisico_id;
          this.analysisStatus.sensorial = !!a?.analisisSensorial_id;
          this.analysisStatus.defectos = !!a?.analisisDefectos_id;
        },
        error: () => {
          this.analysisStatus = { fisico: false, sensorial: false, defectos: false, rapido: null };
        }
      });
    } else if (this.selectedTargetType === 'Muestra') {
      this.analisisSvc.getAnalisisByMuestraId(id).subscribe({
        next: (a) => {
          this.analysisStatus.fisico = !!a?.analisisFisico_id;
          this.analysisStatus.sensorial = !!a?.analisisSensorial_id;
          this.analysisStatus.defectos = !!a?.analisisDefectos_id;
        },
        error: () => {
          this.analysisStatus = { fisico: false, sensorial: false, defectos: false, rapido: null };
        }
      });
    } else if (this.selectedTargetType === 'Café Tostado') {
      this.tostadoSvc.getById(id).subscribe({
        next: (t) => { this.analysisStatus.rapido = !!t?.id_analisis_rapido; },
        error: () => { this.analysisStatus.rapido = false; }
      });
    }
  }

  // Clase para el puntito (verde/rojo/gris)
  statusDotClass(tab: 'fisico' | 'sensorial' | 'defectos' | 'rapido') {
    const v = this.analysisStatus[tab];
    return v === true ? 'bg-green-500' : v === false ? 'bg-red-500' : 'bg-gray-300';
  }

  get nombreMuestra(): string {
    return this.muestraPicked?.nombre_muestra ?? 'N/A';
  }

  onMuestraChange(id: string) {
    if (this.selectedTargetType !== 'Muestra') return;
    if (!id) { this.muestraPicked = null; return; }

    this.muestraSvc.getById(id).subscribe(m => {
      this.muestraPicked = m;
    });
  }

  onTargetIdChange(id: string) {
    this.selectedLot = id;
    if (this.selectedTargetType === 'Muestra') {
      this.onMuestraChange(id);
    }
    this.ColourEmptyTypeAnalisis();
  }


  async addAnalysis() {

    if (!this.selectedLot) {
      this.uiSvc.alert('warning', 'Falta selección', `Por favor selecciona un ${this.selectedTargetType}`);
      return;
    }

    // Check if is already in history
    const existing = this.history.find(
      (h) => h.targetType === this.selectedTargetType && h.targetId === this.selectedLot && h.analysisType === this.tabLabels[this.selectedTab]
    );
    if (existing) {
      this.uiSvc.alert('warning', 'Análisis existente', `El ${this.selectedTargetType} ${this.selectedLot} ya tiene un análisis ${this.tabLabels[this.selectedTab]} agregado.`);
    } else {
      switch (this.selectedTargetType) {
        case 'Lote':
          await this.handleLoteAnalysis();
          break;
        case 'Muestra':
          await this.handleMuestraAnalysis();
          break;
        case 'Café Tostado':
          await this.handleTostadoAnalysis();
          break;
      }
    }
  }

  resetData() {
    this.selectedTab = this.targetTypes[0] === 'Café Tostado' ? 'rapido' : 'fisico';
    this.selectedMode = 'Crear';
    this.currentAnalysis = null;
    this.showModal = false;
  }

  private async handleLoteAnalysis() {
    // 1) Obtener análisis completo del lote usando Promise en lugar de subscribe
    let analisis: Analisis | null = null;
    try {
      analisis = await lastValueFrom(this.analisisSvc.getAnalisisByLoteId(this.selectedLot));
    } catch (error) {
      this.uiSvc.alert('error', 'Error de servidor', 'No se pudo obtener el análisis del lote.');
    }

    // 2) Obtener estado (tieneFisico/tieneSensorial) via checkAnalysis
    if (analisis) {
      const { tieneFisico, tieneSensorial, tieneDefectos } = await this.checkAnalysis(analisis);
      // 3) Delegar la lógica de flujo a processAnalysis
      await this.processAnalysis('Lote', tieneFisico, tieneSensorial, tieneDefectos, analisis);
    } else {
      // Si no hay análisis, pasar ambos como false
      await this.processAnalysis('Lote', false, false, false, null);
    }
  }

  private async handleMuestraAnalysis() {
    // 1) Obtener análisis completo del lote usando Promise en lugar de subscribe
    let analisis: Analisis | null = null;
    try {
      analisis = await lastValueFrom(this.analisisSvc.getAnalisisByMuestraId(this.selectedLot));
    } catch (error) {
      this.uiSvc.alert('error', 'Error de servidor', 'No se pudo obtener el análisis de la muestra.');
    }

    // 2) Obtener estado (tieneFisico/tieneSensorial) via checkAnalysis
    if (analisis) {
      const { tieneFisico, tieneSensorial, tieneDefectos } = await this.checkAnalysis(analisis);
      // 3) Delegar la lógica de flujo a processAnalysis
      await this.processAnalysis('Muestra', tieneFisico, tieneSensorial, tieneDefectos, analisis);
    } else {
      // Si no hay análisis, pasar ambos como false
      await this.processAnalysis('Muestra', false, false, false, null);
    }
  }

  private async handleTostadoAnalysis() {
    // 1) Recuperar el café tostado por ID
    let tostado: LoteTostado | null = null;
    try {
      tostado = await lastValueFrom(this.tostadoSvc.getById(this.selectedLot));
    } catch {
      this.uiSvc.alert('error', 'Error de servidor', 'No se pudo cargar el café tostado.');
      return;
    }
    if (!tostado) {
      this.uiSvc.alert('error', 'No encontrado', `No existe café tostado con ID ${this.selectedLot}`);
      return;
    }

    // 2) Comprobar si ya hay análisis rápido
    const rapidoId = tostado.id_analisis_rapido;
    if (!rapidoId) {
      // Sin análisis previo: crear uno nuevo
      this.currentAnalysis = null;
      this.createEntry('Café Tostado', 'Crear');
      return;
    }

    // 3) Si ya existe, preguntar editar o crear nuevo
    const editar = await this.askEditOrCreate('Café Tostado', 'rápido');
    if (editar) {
      // Cargar análisis existente
      this.currentAnalysis = await lastValueFrom(this.analisisRapidoSvc.getAnalisisById(rapidoId));
    } else {
      // Crear nuevo
      this.currentAnalysis = null;
    }

    // 3) Empujar al historial Y levantar modal
    this.createEntry('Café Tostado', editar ? 'Editar' : 'Crear');
  }


  private async checkAnalysis(a: Analisis): Promise<{ tieneFisico: boolean; tieneSensorial: boolean; tieneDefectos: boolean }> {
    return {
      tieneFisico: a.analisisFisico_id ? true : false,
      tieneSensorial: a.analisisSensorial_id ? true : false,
      tieneDefectos: a.analisisDefectos_id ? true : false
    };
  }

  private async processAnalysis(target: string, fisico: boolean, sensorial: boolean, defectos: boolean, analisis: Analisis | null) {
    let completo = false;
    let incompleto = false;
    if (fisico && sensorial && defectos) {
      // Si los tres análisis existen, preguntar si editar o crear nuevo
      completo = true;
    }
    else if (fisico || sensorial || defectos) {
      // Si solo uno de los análisis existe, preguntar si completar el otro o editar el existente
      incompleto = true;
    }
    if (completo) {
      // 1) Pregunta si editar o crear
      const editar = await this.askEditOrCreate(target, 'completo');

      // 2) Si edita, carga currentAnalysis usando el objeto analisis
      if (editar && analisis) {
        let id: string;

        if (this.selectedTab === 'fisico') {
          id = analisis.analisisFisico_id!;
          this.currentAnalysis = await lastValueFrom(
            this.analisisFisicoSvc.getAnalisisById(id)
          );
        }
        else if (this.selectedTab === 'sensorial') {
          id = analisis.analisisSensorial_id!;
          this.currentAnalysis = await lastValueFrom(
            this.analisisSensorialSvc.getAnalisisById(id)
          );
        }
        else if (this.selectedTab === 'defectos') {
          id = analisis.analisisDefectos_id!;
          this.currentAnalysis = await lastValueFrom(
            this.analisisDefectosSvc.getAnalisisById(id)
          );
        }
      } else {
        // Crear nuevo
        this.currentAnalysis = null;
      }

      // 3) Empuja al historial
      this.createEntry(target, editar ? 'Editar' : 'Crear');
      return;
    }
    if (incompleto) {
      let editar = false;
      const opts: ConfirmOptions = {
        title: 'Análisis incompleto',
        message: `${target} ya tiene un análisis ${this.tabLabels[this.selectedTab]}. Desea Editarlo?`,
        confirmText: 'Editar',
        cancelText: 'Cancelar',
      }
      // pregunta si editar o crear nuevo si el analisis seleccionado ya existe
      if (this.selectedTab == 'fisico' && fisico) {
        editar = await this.uiSvc.confirm(opts);
        this.selectedMode = editar ? 'Editar' : 'Crear';
        if (!editar) {
          return;// Si no se edita, no se crea nada
        }
      }
      else if (this.selectedTab == 'sensorial' && sensorial) {
        editar = await this.uiSvc.confirm(opts);
        this.selectedMode = editar ? 'Editar' : 'Crear';
        if (!editar) {
          return;// Si no se edita, no se crea nada
        }
      }
      else if (this.selectedTab == 'defectos' && defectos) {
        editar = await this.uiSvc.confirm(opts);
        this.selectedMode = editar ? 'Editar' : 'Crear';
        if (!editar) {
          return;// Si no se edita, no se crea nada
        }
      }
      this.selectedMode = editar ? 'Editar' : 'Crear';
      if (editar) {
        // usuario
        if (this.selectedTab === 'fisico' && fisico) {
          this.currentAnalysis = await lastValueFrom(
            this.analisisFisicoSvc.getAnalisisById(analisis!.analisisFisico_id!)
          );
        } else if (this.selectedTab === 'sensorial' && sensorial) {
          this.currentAnalysis = await lastValueFrom(
            this.analisisSensorialSvc.getAnalisisById(analisis!.analisisSensorial_id!)
          );
        } else if (this.selectedTab === 'defectos' && defectos) {
          this.currentAnalysis = await lastValueFrom(
            this.analisisDefectosSvc.getAnalisisById(analisis!.analisisDefectos_id!)
          );
        }
      }
      this.createEntry(target, this.selectedMode);
      return;
    }

    // Sin análisis previo: crear
    this.currentAnalysis = null;
    this.createEntry(target, 'Crear');

  }

  private async askEditOrCreate(
    target: string,
    analysisLabel: string    // 'completo' o 'rápido'
  ): Promise<boolean> {
    const opts: ConfirmOptions = {
      title: 'Análisis existente',
      message: `${target} ya tiene un análisis ${analysisLabel}. ¿Editar último o crear uno nuevo?`,
      confirmText: 'Editar',
      cancelText: 'Crear nuevo',
    };
    try {
      return await this.uiSvc.confirm(opts);
    } catch {
      return false;
    }
  }

  private createEntry(target: string, mode: 'Crear' | 'Editar') {
    this.selectedMode = mode;
    const entry = {
      targetType: target,
      targetId: this.selectedLot,
      analysisType: this.tabLabels[this.selectedTab],
      mode,
    };
    this.history.push(entry);
    this.saveHistory();
    this.showModal = true;
  }

  onSelectHistory(h: any) {
    this.selectedTargetType = h.targetType;
    this.selectedLot = h.targetId;
    this.selectedTab = Object.entries(this.tabLabels).find(([, v]) => v === h.analysisType)?.[0] || 'fisico';
    this.selectedMode = h.mode as any;
    this.showModal = false;
    setTimeout(() => (this.showModal = true), 0);
  }

  deleteHistory(idx: number, event: MouseEvent) {
    event.stopPropagation();
    const h = this.history[idx];
    const opts: ConfirmOptions = {
      title: 'Eliminar análisis',
      message: `¿Eliminar ${h.targetType} ${h.targetId} (${h.analysisType})?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };
    this.uiSvc.confirm(opts).then((ok) => {
      if (!ok) return;
      const key = `${h.targetType.toUpperCase()}-${h.targetId}-${h.analysisType.toUpperCase()}-${h.mode.toUpperCase()}`;
      localStorage.removeItem(key);
      this.history.splice(idx, 1);
      this.saveHistory();
      if (this.history.length === 0) this.closeModal();
      else this.onSelectHistory(this.history[0]);
    });
  }

  onTabChange(tab: 'fisico' | 'sensorial' | 'rapido' | 'defectos') {
    this.closeModal();
    this.currentAnalysis = null;
    this.selectedTab = tab;
    this.selectedMode = 'Crear';
  }

  async saveAll(): Promise<void> {
    if (!this.history.length) {
      this.uiSvc.alert('info', 'Nada que guardar', 'No hay análisis en el historial.');
      return;
    }

    const failed: typeof this.history = [];

    for (const entry of this.history) {
      const key = `${entry.targetType.toUpperCase()}-${entry.targetId}-${entry.analysisType.toUpperCase()}-${entry.mode.toUpperCase()}`;
      const raw = localStorage.getItem(key);

      if (!raw) {
        failed.push(entry);
        continue;
      }
      const payload = JSON.parse(raw);
      const typeParam =
        entry.targetType === 'Lote' ? 'lote' :
          entry.targetType === 'Muestra' ? 'muestra' :
            null;
      console.log(payload);

      try {
        if (entry.analysisType === this.tabLabels['fisico']) {
          // Físico
          if (entry.mode === 'Editar') {

            await lastValueFrom(
              this.analisisFisicoSvc.updateAnalisis(entry.targetId, payload, typeParam!)
            );

          } else {

            await lastValueFrom(
              this.analisisFisicoSvc.createAnalisis(payload, entry.targetId, typeParam!)
            );

          }

        } else if (entry.analysisType === this.tabLabels['sensorial']) {
          // Sensorial
          if (entry.mode === 'Editar') {

            await lastValueFrom(
              this.analisisSensorialSvc.updateAnalisis(entry.targetId, payload, typeParam!)
            );

          } else {

            await lastValueFrom(
              this.analisisSensorialSvc.createAnalisis(payload, entry.targetId, typeParam!)
            );

          }

        } else if (entry.analysisType === this.tabLabels['defectos']) {
          // Defectos
          if (entry.mode === 'Editar') {
            await lastValueFrom(
              this.analisisDefectosSvc.updateAnalisis(entry.targetId, payload, typeParam!)
            );
          } else {
            await lastValueFrom(
              this.analisisDefectosSvc.createAnalisis(payload, entry.targetId, typeParam!)
            );
          }
        }
        else {
          // Rápido (Café Tostado)
          if (entry.mode === 'Editar') {

            await lastValueFrom(
              this.analisisRapidoSvc.updateAnalisis(entry.targetId!, payload)
            );
          } else {
            await lastValueFrom(
              this.analisisRapidoSvc.createAnalisis(payload, entry.targetId)
            );

          }
        }
        localStorage.removeItem(key);
      } catch (err) {
        console.error('UseCase Error:', err);
        failed.push(entry);
      }
    }
    this.history = failed;
    this.saveHistory();

    // mostrar resultado final
    if (failed.length) {
      this.uiSvc.alert(
        'warning',
        'Guardado parcial',
        `No se pudo guardar algunos analisis. El resto se guardó correctamente.`
      );
    } else {
      this.uiSvc.alert('success', 'Guardado', 'Todos los análisis se guardaron correctamente.');
    }

    this.resetData();
  }


}
