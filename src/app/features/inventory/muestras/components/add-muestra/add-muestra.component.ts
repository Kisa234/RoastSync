import { AlmacenService } from './../../../almacenes/service/almacen.service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, ChevronDown } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { SelectSearchComponent } from '../../../../../shared/components/select-search/select-search.component';
import { MuestraService } from '../../service/muestra.service';
import { VariedadService } from '../../../../../shared/services/variedad.service';
import { UserService } from '../../../../users/service/users-service.service';
import { UbigeoService } from '../../../../../shared/services/ubigeo.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { Muestra } from '../../../../../shared/models/muestra';
import { Variedad } from '../../../../../shared/models/variedad';
import { User } from '../../../../../shared/models/user';
import { Departamento, Distrito, Provincia } from '../../../../../shared/models/ubigeo';
import { Almacen } from '../../../../../shared/models/almacen';
import { filtrarDistritosPorProvincia, inferirProvincia } from '../../../../../shared/utils/ubigeo.utils';


@Component({
  selector: 'add-muestra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './add-muestra.component.html'
})
export class AddMuestraComponent implements OnInit {

  constructor(
    private MuestraSvc: MuestraService,
    private VariedadSvc: VariedadService,
    private userSvc: UserService,
    private ubigeoSvc: UbigeoService,
    private almacenService: AlmacenService,
    private uiSvc: UiService,
  ) { }

  ngOnInit() {
    this.VariedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });
    this.userSvc.getUsers().subscribe(u => {
      this.clientes = u.filter(x => x.rol === 'cliente');
      this.clientesConTienda = [
        { id_user: this.STORE_SENTINEL, nombre: 'FORTUNATO (Tienda)' } as any,
        ...this.clientes
      ];
    });
    this.ubigeoSvc.getDepartamentos().subscribe(deps => this.departamentos = deps);
    this.almacenService.getAlmacenesActivos().subscribe(a => this.almacenes = a);
  }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  // sentinel de UI — no es un id_user real, solo marca "muestra de la tienda"
  readonly STORE_SENTINEL = '__STORE__';

  // tope para el input de año de cosecha (mismo criterio que el backend)
  readonly anioMax = new Date().getFullYear() + 1;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  // Modelo
  model: Partial<Muestra> = {
    productor: '',
    finca: '',
    distrito: '',
    departamento: '',
    provincia: '',
    peso: 0,
    variedades: [],
    proceso: '',
    nombre_muestra: '',
    almacen: '',
    owned_by_store: false,
    id_user: '',
    altura: null,
    anio_cosecha: null,
  };

  // Listas de opciones
  variedades: Variedad[] = [];
  clientes: User[] = [];
  clientesConTienda: User[] = [];
  procesos = ['LAVADO', 'NATURAL', 'HONEY'];
  almacenes: Almacen[] = [];

  // ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  private distritosDepto: Distrito[] = [];   // todos los del departamento
  distritos: Distrito[] = [];                // los que se muestran (filtrados por provincia)

  // ─── Cascada de ubigeo ───────────────────────────────────────────

  onDeptoChange(deptoNombre: string) {
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
    // si el distrito elegido no pertenece a la nueva provincia, se limpia
    if (this.model.distrito && !this.distritos.some(d => d.nombre === this.model.distrito)) {
      this.model.distrito = '';
    }
  }

  onDistritoChange(distritoNombre: string) {
    // si eligió distrito sin provincia, la deducimos del código ubigeo
    if (!this.model.provincia) {
      const prov = inferirProvincia(distritoNombre, this.distritosDepto, this.provincias);
      if (prov) {
        this.model.provincia = prov.nombre;
        this.distritos = filtrarDistritosPorProvincia(this.distritosDepto, this.provincias, prov.nombre);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────

  onClienteChange(idSeleccionado: string) {
    if (idSeleccionado === this.STORE_SENTINEL) {
      this.model.owned_by_store = true;
      this.model.id_user = undefined;
    } else {
      this.model.owned_by_store = false;
      this.model.id_user = idSeleccionado;
    }
  }

  onCancel() {
    this.close.emit();
  }

  /** Campos de rotulado: opcionales, pero si vienen deben ser válidos */
  private validarRotulado(): boolean {
    const anio = this.model.anio_cosecha;
    if (anio != null && (!Number.isInteger(anio) || anio < 2000 || anio > this.anioMax)) {
      this.uiSvc.alert('error', 'Año de cosecha inválido', `Debe estar entre 2000 y ${this.anioMax}`);
      return false;
    }
    const altura = this.model.altura;
    if (altura != null && (!Number.isInteger(altura) || altura <= 0)) {
      this.uiSvc.alert('error', 'Altitud inválida', 'Debe ser un número entero mayor a 0 (msnm)');
      return false;
    }
    return true;
  }

  onSave() {
    if (!this.validarRotulado()) return;

    this.MuestraSvc.create(this.model).subscribe(m => {
      this.create.emit();
      this.close.emit();
    });
  }
}