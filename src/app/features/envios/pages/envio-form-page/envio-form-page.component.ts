import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PaqueteService } from '../../service/paquete.service';
import { EnviosService } from '../../service/envios.service';
import { UserService } from '../../../users/service/users-service.service';
import { UbigeoService } from '../../../../shared/services/ubigeo.service';
import { UiService } from '../../../../shared/services/ui.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

import { PaqueteConItems } from '../../../../shared/models/paquete';
import { CreateEnvio } from '../../../../shared/models/envio';
import { User } from '../../../../shared/models/user';
import { Departamento, Provincia, Distrito } from '../../../../shared/models/ubigeo';
import { QuienPaga } from '../../../../shared/enum/quien-paga.enum';
import { EstadoPaquete } from '../../../../shared/enum/estado-paquete.enum';

@Component({
  selector: 'app-envio-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, SelectSearchComponent, UserNamePipe],
  templateUrl: './envio-form-page.component.html'
})
export class EnvioFormPage implements OnInit {
  readonly Check = Check;
  readonly UserIcon = UserIcon;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly quienPagaOptions = [
    { value: QuienPaga.CLIENTE, label: 'Cliente' },
    { value: QuienPaga.EMPRESA, label: 'Empresa' },
  ];

  readonly mediosEnvioSugeridos = ['Recojo en tienda', 'Olva Courier', 'Shalom', 'InDriver', 'Yango'];

  idPaquete = '';
  paquete: PaqueteConItems | null = null;
  clienteUser: User | null = null;

  loading = false;
  saving = false;
  mostrarAvanzado = false;

  // ---------- Ubigeo (cascada Departamento → Provincia → Distrito) ----------
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  private distritosDelDepartamento: Distrito[] = [];
  distritosFiltrados: Distrito[] = [];

  selectedDepartamentoId: number | null = null;
  selectedProvinciaId: number | null = null;
  selectedDistritoId: number | null = null;

  model: CreateEnvio = {
    id_paquete: '',
    direccion: {
      nombre_destinatario: '',
      telefono: '',
      direccion: '',
      distrito: '',
      provincia: '',
      departamento: '',
      pais: 'Perú',
      codigo_postal: '',
      referencia: '',
      observaciones: '',
    },
    medio_envio: '',
    fecha_programada: '',
    numero_tracking: '',
    costo_envio: undefined,
    quien_paga: undefined,
    peso_total_kg: undefined,
    alto_cm: undefined,
    ancho_cm: undefined,
    largo_cm: undefined,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paqueteSvc: PaqueteService,
    private enviosSvc: EnviosService,
    private userSvc: UserService,
    private ubigeoSvc: UbigeoService,
    private uiSvc: UiService
  ) { }

  ngOnInit(): void {
    this.idPaquete = this.route.snapshot.paramMap.get('id_paquete') || '';
    if (!this.idPaquete) return;

    this.model.id_paquete = this.idPaquete;
    this.ubigeoSvc.getDepartamentos().subscribe(deps => this.departamentos = deps);
    this.load();
  }

  private load(): void {
    this.loading = true;

    this.paqueteSvc.getById(this.idPaquete).subscribe({
      next: (paquete) => {
        this.paquete = paquete;

        if (paquete.estado !== EstadoPaquete.LISTO) {
          this.loading = false;
          this.uiSvc.alert('warning', 'Paquete no disponible',
            'Este paquete no está en estado Listo — no se puede crear un envío todavía.');
          return;
        }

        const envioActivo = (paquete.envios ?? []).find(
          e => e.estado !== 'CANCELADO' && e.estado !== 'DEVUELTO'
        );

        if (envioActivo) {
          this.loading = false;
          this.uiSvc.alert('warning', 'Envío ya existe',
            'Este paquete ya tiene un envío activo registrado.');
          this.router.navigate(['/envios', envioActivo.id_envio]);
          return;
        }

        this.userSvc.getUserById(paquete.id_cliente).subscribe({
          next: (cliente) => {
            this.clienteUser = cliente;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cargar el paquete.');
      }
    });
  }

  // ---------- Cascada Ubigeo ----------

  onDepartamentoChange(id: number): void {
    this.selectedDepartamentoId = id;
    this.selectedProvinciaId = null;
    this.selectedDistritoId = null;
    this.provincias = [];
    this.distritosDelDepartamento = [];
    this.distritosFiltrados = [];
    this.model.direccion.provincia = '';
    this.model.direccion.distrito = '';

    const depto = this.departamentos.find(d => d.id === id);
    this.model.direccion.departamento = depto?.nombre || '';
    if (!depto) return;

    forkJoin({
      provincias: this.ubigeoSvc.getProvincias(depto.codigo).pipe(catchError(() => of([]))),
      distritos: this.ubigeoSvc.getDistritoByDepartamento(depto.codigo).pipe(catchError(() => of([]))),
    }).subscribe(({ provincias, distritos }) => {
      this.provincias = provincias;
      this.distritosDelDepartamento = distritos;
    });
  }

  onProvinciaChange(id: number): void {
    this.selectedProvinciaId = id;
    this.selectedDistritoId = null;
    this.model.direccion.distrito = '';

    const prov = this.provincias.find(p => p.id === id);
    this.model.direccion.provincia = prov?.nombre || '';

    this.distritosFiltrados = prov
      ? this.distritosDelDepartamento.filter(d => d.codigo.startsWith(prov.codigo))
      : [];
  }

  onDistritoChange(id: number): void {
    this.selectedDistritoId = id;
    const dist = this.distritosFiltrados.find(d => d.id === id);
    this.model.direccion.distrito = dist?.nombre || '';
  }

  /** Autocompleta lo que el User realmente tiene guardado. El departamento intenta
   *  emparejar por nombre contra el catálogo de ubigeo para disparar la cascada;
   *  provincia y distrito nunca están en el User, así que siempre quedan a mano. */
  usarDatosCliente(): void {
    if (!this.clienteUser) return;

    this.model.direccion.nombre_destinatario =
      this.clienteUser.nombre_comercial || this.clienteUser.nombre || '';
    this.model.direccion.telefono = String(this.clienteUser.numero_telefono ?? '');
    this.model.direccion.direccion = this.clienteUser.direccion || '';

    const nombreDepto = (this.clienteUser.departamento || '').trim().toLowerCase();
    const match = nombreDepto
      ? this.departamentos.find(d => d.nombre.trim().toLowerCase() === nombreDepto)
      : undefined;

    if (match) {
      this.onDepartamentoChange(match.id);
    } else if (this.clienteUser.departamento) {
      this.uiSvc.alert('warning', 'Departamento no reconocido',
        `"${this.clienteUser.departamento}" no coincide con ningún departamento del catálogo — selecciónalo manualmente.`);
    }
  }

  toggleAvanzado(): void {
    this.mostrarAvanzado = !this.mostrarAvanzado;
  }

  canSave(): boolean {
    const d = this.model.direccion;
    return !!(d.nombre_destinatario && d.telefono && d.direccion && d.distrito && d.provincia && d.departamento);
  }

  onCancel(): void {
    this.router.navigate(['/envios/paquete', this.idPaquete]);
  }

  onSave(): void {
    if (!this.canSave()) {
      this.uiSvc.alert('warning', 'Campos incompletos',
        'Completa nombre, teléfono, dirección, distrito, provincia y departamento del destinatario.');
      return;
    }

    this.saving = true;

    const payload: CreateEnvio = {
      id_paquete: this.idPaquete,
      direccion: { ...this.model.direccion },
      medio_envio: this.model.medio_envio || undefined,
      fecha_programada: this.model.fecha_programada || undefined,
      numero_tracking: this.model.numero_tracking || undefined,
      costo_envio: this.model.costo_envio || undefined,
      quien_paga: this.model.quien_paga || undefined,
      peso_total_kg: this.model.peso_total_kg || undefined,
      alto_cm: this.model.alto_cm || undefined,
      ancho_cm: this.model.ancho_cm || undefined,
      largo_cm: this.model.largo_cm || undefined,
    };

    this.enviosSvc.crearEnvio(payload).subscribe({
      next: (envio) => {
        this.saving = false;
        this.uiSvc.alert('success', 'Envío creado', 'El envío quedó registrado correctamente.');
        this.router.navigate(['/envios', envio.id_envio]);
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo crear el envío.');
      }
    });
  }
}