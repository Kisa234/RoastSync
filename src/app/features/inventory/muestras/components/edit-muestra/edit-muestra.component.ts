import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Check, ChevronDown, LucideAngularModule, X } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { SelectSearchComponent } from '../../../../../shared/components/select-search/select-search.component';
import { MuestraService } from '../../service/muestra.service';
import { UserService } from '../../../../users/service/users-service.service';
import { VariedadService } from '../../../../../shared/services/variedad.service';
import { UbigeoService } from '../../../../../shared/services/ubigeo.service';
import { UiService } from '../../../../../shared/services/ui.service';
import { Variedad } from '../../../../../shared/models/variedad';
import { Muestra } from '../../../../../shared/models/muestra';
import { Departamento, Distrito, Provincia } from '../../../../../shared/models/ubigeo';
import { filtrarDistritosPorProvincia, inferirProvincia } from '../../../../../shared/utils/ubigeo.utils';

@Component({
  selector: 'edit-muestra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
  ],
  templateUrl: './edit-muestra.component.html'
})
export class EditMuestraComponent implements OnInit {

  constructor(
    private muestraSvc: MuestraService,
    private userSvc: UserService,
    private variedadSvc: VariedadService,
    private ubigeoSvc: UbigeoService,
    private uiSvc: UiService,
  ) { }

  // icons
  readonly X = X;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;

  @Input() muestraId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();

  // tope para el input de año de cosecha (mismo criterio que el backend)
  readonly anioMax = new Date().getFullYear() + 1;

  model: Partial<Muestra> = {
    productor: '',
    finca: '',
    departamento: '',
    provincia: '',
    distrito: '',
    variedades: [],
    proceso: '',
    nombre_muestra: '',
    altura: null,
    anio_cosecha: null,
  };

  variedades: Variedad[] = [];
  procesos = ['LAVADO', 'NATURAL', 'HONEY'];
  clienteNombreDisplay = '';
  cargando = true;

  // ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  private distritosDepto: Distrito[] = [];
  distritos: Distrito[] = [];

  ngOnInit(): void {
    this.variedadSvc.getAllVariedades().subscribe(v => this.variedades = v);

    forkJoin({
      deps: this.ubigeoSvc.getDepartamentos(),
      muestra: this.muestraSvc.getById(this.muestraId),
    }).subscribe(({ deps, muestra }) => {
      this.departamentos = deps;

      this.model = {
        ...muestra,
        // el backend devuelve variedades como "A, B" → el select múltiple necesita array
        variedades: this.parseVariedades(muestra.variedades as any),
        proceso: (muestra.proceso ?? '').toUpperCase(),
        provincia: muestra.provincia ?? '',
        altura: muestra.altura ?? null,
        anio_cosecha: muestra.anio_cosecha ?? null,
      };

      // dueño: solo lectura (no se edita después de creada)
      this.clienteNombreDisplay = muestra.owned_by_store ? 'FORTUNATO (Tienda)' : (muestra.id_user ?? '—');
      if (muestra.id_user && !muestra.owned_by_store) {
        this.userSvc.getUserById(muestra.id_user).subscribe(u => {
          this.clienteNombreDisplay = u?.nombre_comercial || u?.nombre || muestra.id_user!;
        });
      }

      this.cargarUbigeoInicial();
    });
  }

  /**
   * Carga provincias/distritos del departamento guardado SIN limpiar los valores,
   * y si la muestra no tiene provincia (registros antiguos), la deduce del distrito.
   */
  private cargarUbigeoInicial() {
    const dept = this.departamentos.find(d => d.nombre === this.model.departamento);
    if (!dept) { this.cargando = false; return; }

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
      this.cargando = false;
    });
  }

  // ─── Cascada de ubigeo (cambios manuales del usuario) ───────────

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
    if (this.model.distrito && !this.distritos.some(d => d.nombre === this.model.distrito)) {
      this.model.distrito = '';
    }
  }

  onDistritoChange(distritoNombre: string) {
    if (!this.model.provincia) {
      const prov = inferirProvincia(distritoNombre, this.distritosDepto, this.provincias);
      if (prov) {
        this.model.provincia = prov.nombre;
        this.distritos = filtrarDistritosPorProvincia(this.distritosDepto, this.provincias, prov.nombre);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────

  parseVariedades(variedades: string | string[]): string[] {
    if (Array.isArray(variedades)) return variedades;
    if (!variedades) return [];
    return variedades.split(',').map(v => v.trim()).filter(Boolean);
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    const faltantes: string[] = [];
    if (!this.model.productor?.trim()) faltantes.push('Productor');
    if (!this.model.finca?.trim()) faltantes.push('Finca');
    if (!this.model.departamento?.trim()) faltantes.push('Departamento');
    if (!this.model.distrito?.trim()) faltantes.push('Distrito');
    if (!this.model.variedades?.length) faltantes.push('Variedades');
    if (!this.model.proceso?.trim()) faltantes.push('Proceso');
    if (faltantes.length) {
      this.uiSvc.alert('error', 'Campos incompletos', `Faltan: ${faltantes.join(', ')}`);
      return;
    }

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

    // Payload explícito: NO se manda id_user/owned_by_store (el dueño no se edita)
    // ni peso/almacén (esos viven en el inventario de la muestra).
    const payload: Partial<Muestra> = {
      productor: this.model.productor,
      finca: this.model.finca,
      nombre_muestra: this.model.nombre_muestra,
      departamento: this.model.departamento,
      provincia: this.model.provincia || null,
      distrito: this.model.distrito,
      altura: this.model.altura ?? null,
      anio_cosecha: this.model.anio_cosecha ?? null,
      proceso: this.model.proceso,
      variedades: this.model.variedades,
    };

    this.muestraSvc.update(this.muestraId, payload).subscribe(() => {
      this.uiSvc.alert('success', 'Éxito', 'Muestra actualizada');
      this.update.emit();
      this.close.emit();
    });
  }
}
