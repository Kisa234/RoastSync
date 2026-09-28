import { Component, EventEmitter, Output, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, ChevronDown } from 'lucide-angular';

import { MuestraService } from '../../../muestras/service/muestra.service';
import { LoteService } from '../../service/lote.service';
import { Muestra } from '../../../../../shared/models/muestra';
import { Lote } from '../../../../../shared/models/lote';
import { UserService } from '../../../../users/service/users-service.service';
import { Variedad } from '../../../../../shared/models/variedad';
import { VariedadService } from '../../../../../shared/services/variedad.service';
import { SelectSearchComponent } from '../../../../../shared/components/select-search/select-search.component';
import { Departamento, Distrito, Provincia } from '../../../../../shared/models/ubigeo';
import { UbigeoService } from '../../../../../shared/services/ubigeo.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { IngresoCafeService } from '../../service/ingreso-cafe.service';
import { AlmacenService } from '../../../almacenes/service/almacen.service';
import { Almacen } from '../../../../../shared/models/almacen';
import { forkJoin } from 'rxjs';
import { filtrarDistritosPorProvincia, inferirProvincia } from '../../../../../shared/utils/ubigeo.utils';

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
    private ubigeoSvc: UbigeoService,
    private uiSvc: UiService,
    private ingresoCafeSvc: IngresoCafeService,
    private almacenService: AlmacenService
  ) { }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  // sentinel de UI — no es un id_user real, solo marca "lote de la tienda"
  readonly STORE_SENTINEL = '__STORE__';

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
    eliminado: false,
    almacen: '',
    owned_by_store: false,
    provincia: '',
    anio_cosecha: null,
    altura: null,
  };

  // tope para el input de año de cosecha (mismo criterio que el backend)
  readonly anioMax = new Date().getFullYear() + 1;

  variedades: Variedad[] = [];
  procesos = ['LAVADO', 'NATURAL', 'HONEY'];
  clasificaciones = ['SELECTO', 'CLASICO', 'EXCLUSIVO', 'ESPECIAL', 'GOURMET'];
  almacenes: Almacen[] = [];

  // datos de muestras
  muestras: Muestra[] = [];
  selectedMuestraId = '';
  muestraPeso = 0;
  clientes: any[] = [];
  clientesConTienda: any[] = [];

  ngOnInit() {
    this.muestraSvc.getAll().subscribe(list => this.muestras = list);
    this.userSvc.getUsers().subscribe(u => {
      this.clientes = u.filter(x => x.rol === 'cliente');
      this.clientesConTienda = [
        { id_user: this.STORE_SENTINEL, nombre: 'FORTUNATO (Tienda)' },
        ...this.clientes
      ];
    });
    this.variedadSvc.getAllVariedades().subscribe(variedades => {
      this.variedades = variedades;
    });
    this.ubigeoSvc.getDepartamentos().subscribe(deps => {
      this.departamentos = deps;
    });
    this.almacenService.getAlmacenesActivos().subscribe(a => this.almacenes = a);
  }

  onClienteChange(idSeleccionado: string) {
    if (idSeleccionado === this.STORE_SENTINEL) {
      this.model.owned_by_store = true;
      this.model.id_user = undefined;
    } else {
      this.model.owned_by_store = false;
      this.model.id_user = idSeleccionado;
    }
  }

  onMuestraChange(muestraId: string) {
    this.selectedMuestraId = muestraId;
    this.cleanModel();
    this.muestraSvc.getById(muestraId).subscribe(muestra => {
      this.model.productor = muestra.productor,
        this.model.finca = muestra.finca,
        this.model.distrito = muestra.distrito,
        this.model.departamento = muestra.departamento,
        this.model.variedades = this.parseVariedades(muestra.variedades),
        this.model.proceso = muestra.proceso.toUpperCase(),
        this.model.owned_by_store = muestra.owned_by_store,
        this.model.id_user = muestra.owned_by_store ? undefined : muestra.id_user,

        this.model.peso = 0;

      // datos de rotulado: se precargan de la muestra pero quedan editables
      this.model.provincia = muestra.provincia ?? '';
      this.model.anio_cosecha = muestra.anio_cosecha ?? null;
      this.model.altura = muestra.altura ?? null;

      // carga provincias del departamento de la muestra; si la muestra no tiene
      // provincia (registros antiguos), se deduce del distrito por ubigeo
      this.cargarUbigeo(this.model.departamento, true);
    })
  }

  parseVariedades(variedades: string | string[]): string[] {
    if (Array.isArray(variedades)) return variedades;
    if (!variedades) return [];
    return variedades.split(',').map(v => v.trim()).filter(Boolean);
  }

  getClienteNombre(id_user?: string): string {
    if (!id_user) return '';
    const cliente = this.clientes.find(c => c.id_user === id_user);
    return cliente?.nombre_comercial || cliente?.nombre || id_user;
  }

  selectTab(key: string) {
    this.activeTab = key;
    // limpiar selección
    this.selectedMuestraId = '';
    this.muestraPeso = 0;
    this.cleanModel();
    this.provincias = [];
    this.distritosDepto = [];
    this.distritos = [];
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
      eliminado: false,
      owned_by_store: false,
      almacen: '',
      provincia: '',
      anio_cosecha: null,
      altura: null,
    };
  }

  isButtonDisabled(): boolean {
    return !this.selectedMuestraId || (this.model.peso ?? 0) <= 0;
  }

  onCancel() {
    this.close.emit();
  }

  // ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  private distritosDepto: Distrito[] = [];   // todos los del departamento
  distritos: Distrito[] = [];                // los que se muestran (filtrados por provincia)

  @Output() selection = new EventEmitter<{ depto: Departamento; distrito: Distrito }>();

  /**
   * Carga provincias + distritos del departamento.
   * @param inferir si true y no hay provincia, la deduce del distrito actual (sin limpiar valores)
   */
  private cargarUbigeo(deptoNombre?: string, inferir = false) {
    const dept = this.departamentos.find(d => d.nombre === deptoNombre);
    if (!dept) return;

    forkJoin({
      provincias: this.ubigeoSvc.getProvincias(dept.codigo),
      distritos: this.ubigeoSvc.getDistritoByDepartamento(dept.codigo),
    }).subscribe(({ provincias, distritos }) => {
      this.provincias = provincias;
      this.distritosDepto = distritos;

      if (inferir && !this.model.provincia) {
        const prov = inferirProvincia(this.model.distrito, distritos, provincias);
        if (prov) this.model.provincia = prov.nombre;
      }
      this.distritos = filtrarDistritosPorProvincia(distritos, provincias, this.model.provincia);
    });
  }

  onDeptoChange(deptoNombre: string) {
    this.model.provincia = '';
    this.model.distrito = '';
    this.provincias = [];
    this.distritosDepto = [];
    this.distritos = [];
    this.cargarUbigeo(deptoNombre);
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

  addIngreso(lote: Lote) {
    this.uiSvc.confirm({
      title: 'Registrar ingreso de café',
      message: `¿Deseas registrar ${lote.peso} g como ingreso inicial para este lote?`,
      confirmText: 'Sí, registrar',
      cancelText: 'No'
    }).then(confirmed => {
      if (!confirmed) { return }

      this.ingresoCafeSvc.createIngreso({
        id_lote: lote.id_lote,
        cantidad_kg: lote.peso,
        costo_unitario: lote.costo ?? 0,
        proveedor: lote.productor,
        id_user: lote.id_user
      }).subscribe(() => { });

    });
  }

  /**
   * Validador único de campos obligatorios, reutilizado por ambos flujos
   * (manual y desde-muestra). Devuelve true si todo está completo; si falta
   * algo, avisa con UiService y devuelve false sin lanzar el request.
   */
  private validarModelo(): boolean {
    const faltantes: string[] = [];

    if (!this.model.productor?.trim()) faltantes.push('Productor');
    if (!this.model.finca?.trim()) faltantes.push('Finca');
    if (!this.model.departamento?.trim()) faltantes.push('Departamento');
    if (!this.model.distrito?.trim()) faltantes.push('Distrito');
    if (!this.model.peso || this.model.peso <= 0) faltantes.push('Peso');
    if (!this.model.variedades || this.model.variedades.length === 0) faltantes.push('Variedades');
    if (!this.model.proceso?.trim()) faltantes.push('Proceso');
    if (!this.model.almacen?.trim()) faltantes.push('Almacén');

    // Clasificación solo es obligatoria para lotes de tienda
    if (this.model.owned_by_store && !this.model.clasificacion?.trim()) {
      faltantes.push('Clasificación');
    }

    // Propiedad: o es de tienda, o tiene un cliente asignado — nunca ambos vacíos
    if (!this.model.owned_by_store && !this.model.id_user) {
      faltantes.push('Cliente (o marcar como Tienda)');
    }

    if (faltantes.length > 0) {
      this.uiSvc.alert(
        'error',
        'Campos incompletos',
        `Faltan los siguientes campos: ${faltantes.join(', ')}`
      );
      return false;
    }

    // Campos de rotulado: opcionales, pero si vienen deben ser válidos
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
    if (this.activeTab === 'manual') {
      this.saveManual();
    } else if (this.activeTab === 'desde-muestra') {
      this.saveFromMuestra();
    }
  }

  saveManual() {
    if (!this.validarModelo())return;
    console.log('Creando lote manual', this.model);

    this.loteSvc.create(this.model).subscribe(l => {
      this.addIngreso(l);
      this.create.emit();
      this.close.emit();
    });
  }

  saveFromMuestra() {
    if (!this.selectedMuestraId) {
      this.uiSvc.alert('error', 'Campos incompletos', 'Debes seleccionar una muestra');
      return;
    }
    if (!this.validarModelo()) return;

    this.loteSvc.createByMuestra(this.selectedMuestraId, this.model).subscribe(l => {
      this.addIngreso(l);
      this.create.emit();
      this.close.emit();
    });
  }
}