import { Component, EventEmitter, Output, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { LucideAngularModule }              from 'lucide-angular';
import { X, Check, ChevronDown}                         from 'lucide-angular';

import { MuestraService } from '../../service/muestra.service';
import { LoteService }    from '../../service/lote.service';
import { Muestra }        from '../../../../shared/models/muestra';
import { Lote }           from '../../../../shared/models/lote';

@Component({
  selector: 'add-lote',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './add-lote.component.html'
})
export class AddLoteComponent implements OnInit {
  
  constructor(
    private loteSvc:    LoteService,
    private muestraSvc: MuestraService
  ) {}

  // icons
  readonly X           = X;
  readonly Check       = Check;
  readonly ChevronDown = ChevronDown;


  @Output() close  = new EventEmitter<void>();
  @Output() create = new EventEmitter<Lote>();

  // pestañas
  tabs: { key: string; label: string }[] = [
    { key: 'manual',       label: 'Manual' },
    { key: 'desde-muestra', label: 'Desde Muestra' }
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
  };
  
  variedades: string[] = [
    'Typica','Bourbon','Mundo Novo','Maragogipe','Caturra','Villa Sarchí',
    'Pacas','Catuaí','Geisha','Pacamara','Sarchimor','Catimor',
    'SL28','SL34','Castillo','Cenicafé 1','Tabi','Híbridos F1','Moka',
    'Jamaica Blue Mountain','Kona','Marshell','Sidra','Bourbon Amarillo',
    'Bourbon Rosado','Bourbon Enano','Caturra Amarillo','Papayo','Arara'
  ];
  procesos = ['Lavado','Natural','Honey'];


  // datos de muestras
  muestras: Muestra[] = [];
  selectedMuestraId = '';
  muestraPeso = 0;

  // dropdown variedades
  showVarDropdown = false;
  filterVar       = '';

  @ViewChild('varietyContainer', { static: true }) varietyContainer!: ElementRef;

  toggleVarDropdown() {
    this.showVarDropdown = !this.showVarDropdown;
    if (this.showVarDropdown) this.filterVar = '';
  }

  @HostListener('document:click', ['$event.target'])
  closeVarDropdown(target: HTMLElement) {
    if (this.showVarDropdown && !this.varietyContainer.nativeElement.contains(target)) {
      this.showVarDropdown = false;
    }
  }

  get filteredVariedades(): string[] {
    const q = this.filterVar.trim().toLowerCase();
    return this.variedades.filter(v => !q || v.toLowerCase().includes(q));
  }

  onVarToggle(v: string) {
    const arr = this.model.variedades || [];
    this.model.variedades = arr.includes(v)
      ? arr.filter(x => x !== v)
      : [...arr, v];
  }


  ngOnInit() {
    this.muestraSvc.getAll().subscribe(list => this.muestras = list);
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
      this.create.emit(l);
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
      this.create.emit(l);
      this.close.emit();  
    });
  }
}
