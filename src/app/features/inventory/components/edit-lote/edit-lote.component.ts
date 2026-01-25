import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { SelectSearchComponent } from "../../../../shared/components/select-search/select-search.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Check, ChevronDown, LucideAngularModule, X } from 'lucide-angular';
import { LoteService } from '../../service/lote.service';
import { MuestraService } from '../../service/muestra.service';
import { UserService } from '../../../users/service/users-service.service';
import { VariedadService } from '../../../../shared/services/variedad.service';
import { UbigeoService } from '../../../../shared/services/ubigeo.service';
import { Lote } from '../../../../shared/models/lote';
import { Variedad } from '../../../../shared/models/variedad';
import { Departamento, Distrito } from '../../../../shared/models/ubigeo';
import { Cambio } from '../../../../shared/models/cambio';
import { Historial } from '../../../../shared/models/historial';
import { UiService } from '../../../../shared/services/ui.service';
import { HistorialService } from '../../../../shared/services/historial.service';

@Component({
  selector: 'edit-lote',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './edit-lote.component.html',
  styles: ``
})
export class EditLoteComponent implements OnInit {

  constructor(
    private loteSvc: LoteService,
    private muestraSvc: MuestraService,
    private userSvc: UserService,
    private variedadSvc: VariedadService,
    private ubigeoSvc: UbigeoService,
    private uiSvc: UiService,
    private historialService: HistorialService
  ) { }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  @Input() loteId: string = 'CABL-8';
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  onCancel() {
    this.close.emit();
  }

  variedades: Variedad[] = [];
  procesos = ['LAVADO', 'NATURAL', 'HONEY'];
  clasificaciones = ['SELECTO', 'CLASICO', 'EXCLUSIVO', 'ESPECIAL', 'GOURMET'];

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



  clientes: any[] = [];

  // ubigeo 
  departamentos: Departamento[] = [];
  distritos: Distrito[] = []

  selectedDeptoId?: string;
  selecterDistId?: string

  @Output() selection = new EventEmitter<{ depto: Departamento; distrito: Distrito }>();


  ngOnInit(): void {
    // 1. Cargar datos que no dependen del lote
    this.userSvc.getUsers().subscribe(u => this.clientes = u);
    this.variedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });

    // 2. Cargar departamentos primero
    this.ubigeoSvc.getDepartamentos().subscribe(deps => {
      this.departamentos = deps;

      // 3. Ahora que tenemos departamentos, cargar el lote
      this.loteSvc.getById(this.loteId).subscribe(lote => {
        this.model = { ...lote };

        // 4. Si el lote tiene departamento, cargar sus distritos
        if (this.model.departamento) {
          const dept = this.departamentos.find(d => d.nombre === this.model.departamento);
          if (dept) {
            this.ubigeoSvc.getDistritoByDepartamento(dept.codigo)
              .subscribe(provs => {
                this.distritos = provs;
                // El distrito del modelo ya está asignado, solo cargamos la lista
              });
          }
        }
      });
    });
  }


  onDeptoChange(deptoNombre: string) {
    // Solo limpiar distrito cuando es un cambio manual del usuario
    this.model.distrito = '';
    this.distritos = [];

    const dept = this.departamentos.find(d => d.nombre === deptoNombre);
    if (!dept) return;

    this.ubigeoSvc.getDistritoByDepartamento(dept.codigo)
      .subscribe(provs => this.distritos = provs);
  }

  saveManual() {
    if (this.model.peso <= 0) {
      this.uiSvc.alert('error', 'error','El peso del lote debe ser mayor a cero.', 5000);
      return;
    }

    this.uiSvc.prompt({
      title: 'Confirmar edición',
      message: 'Por favor, ingrese un comentario para el historial de cambios:',
      placeholder: 'Comentario',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    }).then(res => {
      if (!res.confirmed) return;
      
      const payload = {
        ...this.model,
         hcomentario: res.value ?? ''
      };

      this.loteSvc.update(this.model.id_lote, payload).subscribe(l => {
        this.create.emit();

        if (this.model.peso == 0) {
          this.loteSvc.delete(this.model.id_lote).subscribe();
        }

        this.close.emit();
      });
    });


  }


}
