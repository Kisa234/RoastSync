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
import { Departamento, Distrito, Provincia } from '../../../../shared/models/ubigeo';
import { UbigeoService } from '../../../../shared/services/ubigeo.service';

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
    private variedadSvc: VariedadService,
    private ubigeoSvc: UbigeoService
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
  ];
  activeTab = 'manual';

  // modelo manual
  model: Lote = {
    productor: '',
    finca: '',
    distrito: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: 'Lote Verde',
    id_user: '',
    clasificacion: '',
    costo: 0,
    id_lote: '',
    fecha_registro: new Date(),
    eliminado: false
  };

  variedades: Variedad[] = [];
  procesos = ['Lavado', 'Natural', 'Honey'];
  clasificaciones = ['Selecto', 'Clasico', 'Exclusivo', 'Especial'];


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
    this.ubigeoSvc.getDepartamentos().subscribe(deps => {
      this.departamentos = deps;
    });
  }

  onMuestraChange(muestraId: string) {
    this.selectedMuestraId = muestraId;
    this.cleanModel();
    this.muestraSvc.getById(muestraId).subscribe(muestra => {
      this.model.productor = muestra.productor,
      this.model.finca = muestra.finca,
      this.model.distrito = muestra.distrito,
      this.model.departamento = muestra.departamento,
      this.model.variedades = muestra.variedades,
      this.model.proceso = muestra.proceso,
      this.model.id_user = muestra.id_user,

      this.model.peso = 0;
    })
  }

  selectTab(key: string) {
    this.activeTab = key;
    // limpiar selección
    this.selectedMuestraId = '';
    this.muestraPeso = 0;
    this.cleanModel();
  }

  cleanModel() {
    this.model = {
      productor: '',
      finca: '',
      distrito: '',
      departamento: '',
      peso: 0,
      variedades: [],
      proceso: '',
      tipo_lote: 'Lote Verde',
      id_user: '',
      clasificacion: '',
      id_lote: '',
      fecha_registro: new Date(),
      eliminado: false
    };
  }

  isButtonDisabled(): boolean {
    return !this.selectedMuestraId || (this.model.peso ?? 0) <= 0;
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

  // ubigeo 
  departamentos: Departamento[] = [];
  distritos: Distrito[]= []

  selectedDeptoId?: string;
  selecterDistId?:string

  @Output() selection = new EventEmitter<{ depto: Departamento; distrito: Distrito }>();

  onDeptoChange(deptoNombre: string) {
    this.model.distrito = '';
    this.distritos = [];

    // buscamos el código interno a partir del nombre
    const dept = this.departamentos.find(d => d.nombre === deptoNombre);
    if (!dept) return;

    this.ubigeoSvc.getDistritoByDepartamento(dept.codigo)
      .subscribe(provs => this.distritos = provs);
  }


  onSave() {
    if (this.activeTab === 'manual') {
      this.saveManual();
    } else if (this.activeTab === 'desde-muestra') {
      this.saveFromMuestra();
    }
  }

  saveFromMuestra() {
    console.log(this.selectedMuestraId);
    console.log(this.model);
    this.loteSvc.createByMuestra(this.selectedMuestraId, this.model).subscribe(l => {
      this.create.emit();
      this.close.emit();
    });
  }
}
