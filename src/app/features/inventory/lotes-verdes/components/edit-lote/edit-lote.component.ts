import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Check, ChevronDown, LucideAngularModule, X } from 'lucide-angular';
import { SelectSearchComponent } from '../../../../../shared/components/select-search/select-search.component';
import { LoteService } from '../../service/lote.service';
import { MuestraService } from '../../../muestras/service/muestra.service';
import { UserService } from '../../../../users/service/users-service.service';
import { VariedadService } from '../../../../../shared/services/variedad.service';
import { UbigeoService } from '../../../../../shared/services/ubigeo.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { Variedad } from '../../../../../shared/models/variedad';
import { Lote } from '../../../../../shared/models/lote';
import { Departamento, Distrito, Provincia } from '../../../../../shared/models/ubigeo';
import { forkJoin } from 'rxjs';
import { filtrarDistritosPorProvincia, inferirProvincia } from '../../../../../shared/utils/ubigeo.utils';

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
    eliminado: false,
    provincia: '',
    anio_cosecha: null,
    altura: null,
  };

  // tope para el input de año de cosecha (mismo criterio que el backend)
  readonly anioMax = new Date().getFullYear() + 1;



  clientes: any[] = [];

  // ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  private distritosDepto: Distrito[] = [];   // todos los del departamento
  distritos: Distrito[] = [];                // los que se muestran (filtrados por provincia)
  clienteNombreDisplay = '';

  @Output() selection = new EventEmitter<{ depto: Departamento; distrito: Distrito }>();


  ngOnInit(): void {
    // 1. Cargar datos que no dependen del lote
    // (ya no cargamos "clientes" — el dueño del lote no se edita después de creado)
    this.variedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });

    // 2. Cargar departamentos primero
    this.ubigeoSvc.getDepartamentos().subscribe(deps => {
      this.departamentos = deps;

      // 3. Ahora que tenemos departamentos, cargar el lote
      this.loteSvc.getById(this.loteId).subscribe(lote => {
        this.model = { ...lote };
        this.model.proceso = this.model.proceso.toUpperCase();
        this.model.provincia = lote.provincia ?? '';
        this.clienteNombreDisplay = lote.owned_by_store
          ? 'FORTUNATO (Tienda)'
          : (lote.id_user ?? '—');

        if (lote.id_user && !lote.owned_by_store) {
          this.userSvc.getUserById(lote.id_user).subscribe(u => {
            this.clienteNombreDisplay = u?.nombre_comercial || u?.nombre || lote.id_user!;
          });
        }

        this.cargarUbigeoInicial();
      });
    });
  }

  /**
   * Carga provincias/distritos del departamento guardado SIN limpiar valores.
   * Si el lote no tiene provincia (registros antiguos), la deduce del/los distrito(s):
   * solo si todos pertenecen a la misma provincia y ningún nombre es ambiguo.
   */
  private cargarUbigeoInicial() {
    const dept = this.departamentos.find(d => d.nombre === this.model.departamento);
    if (!dept) return;

    forkJoin({
      provincias: this.ubigeoSvc.getProvincias(dept.codigo),
      distritos: this.ubigeoSvc.getDistritoByDepartamento(dept.codigo),
    }).subscribe(({ provincias, distritos }) => {
      this.provincias = provincias;
      this.distritosDepto = distritos;

      if (!this.model.provincia) {
        const prov = inferirProvincia(this.model.distrito, distritos, provincias);
        if (prov) this.model.provincia = prov.nombre;
      }
      this.distritos = filtrarDistritosPorProvincia(distritos, provincias, this.model.provincia);
    });
  }


  onDeptoChange(deptoNombre: string) {
    // Solo limpiar provincia/distrito cuando es un cambio manual del usuario
    this.model.provincia = '';
    this.model.distrito = '';
    this.provincias = [];
    this.distritosDepto = [];
    this.distritos = [];

    const dept = this.departamentos.find(d => d.nombre === deptoNombre);
    if (!dept) return;

    forkJoin({
      provincias: this.ubigeoSvc.getProvincias(dept.codigo),
      distritos: this.ubigeoSvc.getDistritoByDepartamento(dept.codigo),
    }).subscribe(({ provincias, distritos }) => {
      this.provincias = provincias;
      this.distritosDepto = distritos;
      this.distritos = distritos;
    });
  }

  onProvinciaChange(provinciaNombre: string) {
    this.distritos = filtrarDistritosPorProvincia(this.distritosDepto, this.provincias, provinciaNombre);

    // distrito es multiselección (string "A, B"): se quitan los que no son de la nueva provincia
    if (this.model.distrito) {
      const validos = new Set(this.distritos.map(d => d.nombre));
      this.model.distrito = this.model.distrito
        .split(',')
        .map(n => n.trim())
        .filter(n => validos.has(n))
        .join(', ');
    }
  }

  onDistritoChange(distritoValor: string) {
    // si eligió distrito(s) sin provincia, se deduce (solo si todos son de la misma)
    if (!this.model.provincia) {
      const prov = inferirProvincia(distritoValor, this.distritosDepto, this.provincias);
      if (prov) {
        this.model.provincia = prov.nombre;
        this.distritos = filtrarDistritosPorProvincia(this.distritosDepto, this.provincias, prov.nombre);
      }
    }
  }

  saveManual() {
    if (this.model.peso <= 0) {
      this.uiSvc.alert('error', 'error', 'El peso del lote debe ser mayor a cero.', 5000);
      return;
    }

    // Campos de rotulado: opcionales, pero si vienen deben ser válidos
    const anio = this.model.anio_cosecha;
    if (anio != null && (!Number.isInteger(anio) || anio < 2000 || anio > this.anioMax)) {
      this.uiSvc.alert('error', 'Año de cosecha inválido', `Debe estar entre 2000 y ${this.anioMax}`);
      return;
    }
    const altura = this.model.altura;
    if (altura != null && (!Number.isInteger(altura) || altura <= 0)) {
      this.uiSvc.alert('error', 'Altitud inválida', 'Debe ser un número entero mayor a 0 (msnm)');
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