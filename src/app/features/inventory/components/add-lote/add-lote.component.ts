import { Component, EventEmitter, Output, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, ChevronDown } from 'lucide-angular';

import { MuestraService } from '../../service/muestra.service';
import { LoteService } from '../../service/lote.service';
import { Muestra } from '../../../../shared/models/muestra';
import { Lote } from '../../../../shared/models/lote';
import { UserService } from '../../../users/service/users-service.service';
import { Variedad } from '../../../../shared/models/variedad';
import { VariedadService } from '../../../../shared/services/variedad.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

@Component({
  selector: 'add-lote',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './add-lote.component.html'
})
export class AddLoteComponent implements OnInit {

  constructor(
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private userSvc: UserService,
    private variedadSvc: VariedadService
  ) { }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;


  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  // pestañas
  tabs: { key: string; label: string }[] = [
    { key: 'manual', label: 'Manual' },
    { key: 'desde-muestra', label: 'Desde Muestra' },
    { key: 'lote-cliente', label: 'Lote Cliente' }
  ];
  activeTab = 'manual';

  // modelo manual
  model: Partial<Lote> = {
    productor: '',
    finca: '',
    region: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: 'Lote Verde',
    id_user: '',
  };

  variedades: Variedad[] = [];
  procesos = ['Lavado', 'Natural', 'Honey'];


  // datos de muestras
  muestras: Muestra[] = [];
  selectedMuestraId = '';
  muestraPeso = 0;
  clientes: any[] = [];


  ngOnInit() {
    this.muestraSvc.getAll().subscribe(list => this.muestras = list);
    this.userSvc.getUsers().subscribe(u => this.clientes = u);
    this.variedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });
  }

  selectTab(key: string) {
    this.activeTab = key;
    // limpiar selección
    this.selectedMuestraId = '';
    this.muestraPeso = 0;
  }

  onCancel() {
    this.close.emit();
  }

  saveManual() {
    this.loteSvc.create(this.model).subscribe(l => {
      this.create.emit();
      this.close.emit();
    });
  }

  onSave() {
    if (this.activeTab === 'manual') {
      this.saveManual();
    } else if (this.activeTab === 'desde-muestra') {
      this.saveFromMuestra();
    }
  }

  saveFromMuestra() {
    this.loteSvc.createByMuestra(this.selectedMuestraId, this.muestraPeso).subscribe(l => {
      this.create.emit();
      this.close.emit();
    });
  }

  saveLoteCliente() {
    this.loteSvc.createRapido(this.model).subscribe(l => {
      this.create.emit();
      this.close.emit();
    });
  }
}
