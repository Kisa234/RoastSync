import { UiService } from './../../../shared/services/ui.service';
import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { Search, Eye, Edit2, Trash2 } from 'lucide-angular';
import { Observable } from 'rxjs';

import { Muestra } from '../../../shared/models/muestra';
import { Lote } from '../../../shared/models/lote';
import { LoteTostado } from '../../../shared/models/lote-tostado';

import { MuestraService } from '../service/muestra.service';
import { LoteService } from '../service/lote.service';
import { LoteTostadoService } from '../service/lote-tostado.service';
import { AddLoteComponent } from '../components/add-lote/add-lote.component';
import { AddMuestraComponent } from '../components/add-muestra/add-muestra.component';
import { ReportLoteComponent } from '../components/report-lote/report-lote.component';

type InventoryTab = 'muestras' | 'verde' | 'tostado';

@Component({
  selector: 'inventory-page',
  imports: [ 
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    AsyncPipe,
    LucideAngularModule,
    AddLoteComponent,
    AddMuestraComponent,
    ReportLoteComponent
  ],
  templateUrl: './inventory-page.component.html',
  styles: ``
})
export class InventoryPage {
  // iconos
  readonly Search = Search;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Plus =Plus;


  // pestañas
  tabs = [
    { key: 'muestras', label: 'Muestras' },
    { key: 'verde',    label: 'Lotes Café Verde' },
    { key: 'tostado',  label: 'Café Tostado' },
  ];
  activeTab: 'muestras' | 'verde' | 'tostado' = 'muestras';

  // streams de datos
  muestras$!: Observable<Muestra[]>;
  lotes$!:   Observable<Lote[]>;
  tostados$!:Observable<LoteTostado[]>;
  showAddMuestra = false;
  showAddLote    = false;
  showReportLote = false;
  filterText = '';
  selectedLoteId = '';
  selectedMuestraId = '';

  constructor(
    private muestraService: MuestraService,
    private loteService:   LoteService,
    private tostService:   LoteTostadoService, 
    private uiService: UiService,
  ) {}

  ngOnInit() {
    this.loadMuestras();
  }

  openAdd() {
    if (this.activeTab === 'muestras')   this.showAddMuestra = true;
    else if (this.activeTab === 'verde') this.showAddLote    = true;
  }

  onMuestraCreated(m: Muestra) {
    this.showAddMuestra = false;
    this.loadMuestras();
  }
  onLoteCreated(l: Lote) {
    this.showAddLote = false;
    this.loadLotes();
  }

  onReportLote(l: Lote) {
    this.loteService.getById(l.id_lote).subscribe(lote => {
      if (!lote || !lote.id_analisis) {
        this.uiService.alert('error', 'Error', 'El lote no tiene análisis asociado');
        return;
      } else {
        this.selectedLoteId = l.id_lote;
        this.showReportLote = true;
      }
    });
  }

  onReportMuestra(m: Muestra) {
    this.muestraService.getById(m.id_muestra).subscribe(muestra => {
      if (!muestra || !muestra.analisis_id) {
        this.uiService.alert('error', 'Error', 'La muestra no tiene análisis asociado');
        return;
      } else {
        this.selectedMuestraId = muestra.id_muestra;
        this.showReportLote = true;
      }
    })
  }
  

  onTabSelect(key: string) {
    this.activeTab = key as InventoryTab;
    if (key === 'muestras')   this.loadMuestras();
    else if (key === 'verde')   this.loadLotes();
    else if (key === 'tostado') this.loadTostados();
  }

  loadMuestras() {
    this.muestras$ = this.muestraService.getAll();
  }

  loadLotes() {
    this.lotes$ = this.loteService.getAll();
  }

  loadTostados() {
    this.tostados$ = this.tostService.getAll();
  }

  onSearchChange() {
    this.loadMuestras();
  }

  // acciones de fila (placeholder)
  onView(item: any)   { /* navegar a detalle */ }
  onEdit(item: any)   { /* abrir modal edición */ }
  onDelete(item: any) { /* confirmar y eliminar */ }
}
