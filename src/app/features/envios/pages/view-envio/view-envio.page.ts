import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, Truck, Check, Ban, RotateCcw, Printer } from 'lucide-angular';

import { EnviosService } from '../../service/envios.service';
import { UiService } from '../../../../shared/services/ui.service';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

import { EnvioConDetalle } from '../../../../shared/models/envio';
import { EstadoEnvio } from '../../../../shared/enum/estado-envio.enum';
import { PrintOrdenDespachoComponent, OrdenDespachoImprimible } from '../../components/print-orden-despacho/print-orden-despacho.component';

@Component({
  selector: 'app-view-envio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UserNamePipe, PrintOrdenDespachoComponent],
  templateUrl: './view-envio.page.html'
})
export class ViewEnvioPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Calendar = Calendar;
  readonly Truck = Truck;
  readonly Check = Check;
  readonly Ban = Ban;
  readonly RotateCcw = RotateCcw;
  readonly EstadoEnvio = EstadoEnvio;

  readonly Printer = Printer;
  showPrintModal = false;

  idEnvio = '';
  envio: EnvioConDetalle | null = null;
  loading = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enviosSvc: EnviosService,
    private uiSvc: UiService
  ) { }

  ngOnInit(): void {
    this.idEnvio = this.route.snapshot.paramMap.get('id') || '';
    if (!this.idEnvio) return;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.enviosSvc.getEnvioById(this.idEnvio).subscribe({
      next: (envio) => {
        this.envio = envio;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cargar el envío.');
      }
    });
  }

  /** Navega siempre directo al listado — Location.back() dependía del historial
   *  real del navegador y se rompía con el flujo Programar/Despachar en páginas
   *  separadas (podía volver a esas páginas en vez de al listado). */
  goBack(): void {
    this.router.navigate(['/envios']);
  }

  // ---------- Estado / UI helpers ----------

  get puedeProgramar(): boolean {
    return this.envio?.estado === EstadoEnvio.PENDIENTE;
  }

  get puedeDespachar(): boolean {
    return this.envio?.estado === EstadoEnvio.PENDIENTE || this.envio?.estado === EstadoEnvio.PROGRAMADO;
  }

  get puedeCancelar(): boolean {
    return this.envio?.estado === EstadoEnvio.PENDIENTE || this.envio?.estado === EstadoEnvio.PROGRAMADO;
  }

  get puedeConfirmarEntrega(): boolean {
    return this.envio?.estado === EstadoEnvio.DESPACHADO || this.envio?.estado === EstadoEnvio.EN_TRANSITO;
  }

  get puedeRegistrarDevolucion(): boolean {
    const estado = this.envio?.estado;
    return estado === EstadoEnvio.DESPACHADO || estado === EstadoEnvio.EN_TRANSITO || estado === EstadoEnvio.ENTREGADO;
  }

  estadoBadgeClass(): string {
    switch (this.envio?.estado) {
      case EstadoEnvio.PENDIENTE: return 'bg-yellow-100 text-yellow-700';
      case EstadoEnvio.PROGRAMADO: return 'bg-blue-100 text-blue-700';
      case EstadoEnvio.DESPACHADO: return 'bg-indigo-100 text-indigo-700';
      case EstadoEnvio.EN_TRANSITO: return 'bg-purple-100 text-purple-700';
      case EstadoEnvio.ENTREGADO: return 'bg-green-100 text-green-700';
      case EstadoEnvio.CANCELADO: return 'bg-red-100 text-red-700';
      case EstadoEnvio.DEVUELTO: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  labelEstado(estado?: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PROGRAMADO: 'Programado',
      DESPACHADO: 'Despachado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      DEVUELTO: 'Devuelto',
    };
    return labels[estado || ''] || estado || '—';
  }

  // ---------- Navegación a páginas de acción ----------

  irAProgramar(): void {
    this.router.navigate(['/envios', this.idEnvio, 'programar']);
  }

  /** Reemplaza la navegación a página separada — mismo patrón in-page que confirmarEntregaEnvio */
  despacharEnvioInPage(): void {
    if (!this.envio) return;

    const requiereTracking = this.calcularRequiereTracking();

    this.uiSvc.prompt({
      title: 'Despachar Envío',
      message: 'Esto descuenta el stock real de cada artículo del paquete. Asegúrate de que esté listo físicamente'
        + (requiereTracking ? '.' : ` (${this.envio.medio_envio} no requiere tracking).`),
      placeholder: requiereTracking ? 'N.º de tracking (opcional)' : undefined,
      confirmText: 'Confirmar Despacho',
      cancelText: 'Cancelar'
    }).then(({ confirmed, value }) => {
      if (!confirmed) return;

      this.saving = true;
      this.enviosSvc.despachar(this.idEnvio, {
        numero_tracking: requiereTracking ? (value || undefined) : undefined,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.uiSvc.alert('success', 'Envío despachado', 'El stock fue descontado correctamente.');
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo despachar el envío.');
        }
      });
    });
  }

  /** Solo couriers reales necesitan tracking — un viaje de InDriver o un recojo
   *  presencial no lo tienen. Sin medio_envio definido, se pide por defecto. */
  private calcularRequiereTracking(): boolean {
    const medio = (this.envio?.medio_envio || '').trim().toLowerCase();
    if (!medio) return true;
    const sinTracking = ['recojo en tienda', 'indriver', 'yango'];
    return !sinTracking.some(m => medio.includes(m));
  }

  // ---------- Confirmar entrega (in-page, sin navegación) ----------

  confirmarEntregaEnvio(): void {
    this.uiSvc.confirm({
      title: 'Confirmar Entrega',
      message: '¿Confirmas que el paquete fue entregado al destinatario?',
      confirmText: 'Confirmar Entrega',
      cancelText: 'Cancelar'
    }).then(ok => {
      if (!ok) return;

      this.saving = true;
      this.enviosSvc.confirmarEntrega(this.idEnvio, {}).subscribe({
        next: () => {
          this.saving = false;
          this.uiSvc.alert('success', 'Entrega confirmada', 'El envío quedó marcado como entregado.');
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo confirmar la entrega.');
        }
      });
    });
  }

  // ---------- Cancelar ----------

  cancelarEnvio(): void {
    this.uiSvc.prompt({
      title: 'Cancelar Envío',
      message: 'Este envío todavía no descontó stock — se puede cancelar sin efectos en inventario.',
      placeholder: 'Motivo (opcional)',
      confirmText: 'Cancelar Envío',
      cancelText: 'Volver'
    }).then(({ confirmed, value }) => {
      if (!confirmed) return;

      this.saving = true;
      this.enviosSvc.cancelar(this.idEnvio, {
        comentario_cancelacion: value || undefined,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cancelar el envío.');
        }
      });
    });
  }

  // ---------- Registrar devolución ----------

  registrarDevolucionEnvio(): void {
    this.uiSvc.prompt({
      title: 'Registrar Devolución',
      message: 'El stock se reingresará al almacén de origen. El paquete no vuelve automáticamente a "Listo" — si vas a reintentar el envío, revisa el paquete manualmente. ¿Cuál es el motivo?',
      placeholder: 'Motivo (opcional)',
      confirmText: 'Registrar Devolución',
      cancelText: 'Volver'
    }).then(({ confirmed, value }) => {
      if (!confirmed) return;

      this.saving = true;
      this.enviosSvc.registrarDevolucion(this.idEnvio, {
        comentario: value || undefined,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.uiSvc.alert('success', 'Devolución registrada', 'El stock fue reingresado correctamente.');
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo registrar la devolución.');
        }
      });
    });
  }

  // ---------- Impresión ----------

  abrirImprimir(): void {
    this.showPrintModal = true;
  }

  get datosImprimibles(): OrdenDespachoImprimible | null {
    if (!this.envio) return null;
    return {
      numero_orden: this.envio.numero_correlativo,
      id_cliente: this.envio.paquete?.id_cliente || '',
      fecha: this.envio.fecha_registro,
      fecha_programada: this.envio.fecha_programada,
      direccion: this.envio.direccion,
      medio_envio: this.envio.medio_envio,
      numero_tracking: this.envio.numero_tracking,
      quien_paga: this.envio.quien_paga,
      items: (this.envio.paquete?.items ?? []).map(i => ({
        id_entidad: i.id_entidad, cantidad: i.cantidad, unidad_medida: i.unidad_medida
      })),
    };
  }
}