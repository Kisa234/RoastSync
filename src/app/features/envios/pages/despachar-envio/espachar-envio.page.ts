import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Truck } from 'lucide-angular';

import { EnviosService } from '../../service/envios.service';
import { UiService } from '../../../../shared/services/ui.service';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

import { EnvioConDetalle } from '../../../../shared/models/envio';
import { EstadoEnvio } from '../../../../shared/enum/estado-envio.enum';
import { QuienPaga } from '../../../../shared/enum/quien-paga.enum';

@Component({
  selector: 'app-despachar-envio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UserNamePipe],
  templateUrl: './despachar-envio.page.html'
})
export class DespacharEnvioPage implements OnInit {
  readonly Truck = Truck;
  readonly quienPagaOptions = [
    { value: QuienPaga.CLIENTE, label: 'Cliente' },
    { value: QuienPaga.EMPRESA, label: 'Empresa' },
  ];
  readonly mediosEnvioSugeridos = ['Recojo en tienda', 'Olva Courier', 'Shalom', 'InDriver', 'Yango'];

  idEnvio = '';
  envio: EnvioConDetalle | null = null;
  loading = false;
  saving = false;

  model = {
    numero_tracking: '',
  };

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

  private load(): void {
    this.loading = true;
    this.enviosSvc.getEnvioById(this.idEnvio).subscribe({
      next: (envio) => {
        this.envio = envio;

        if (envio.estado !== EstadoEnvio.PENDIENTE && envio.estado !== EstadoEnvio.PROGRAMADO) {
          this.loading = false;
          this.uiSvc.alert('warning', 'No disponible', 'Este envío no está en un estado válido para despachar.');
          this.router.navigate(['/envios', this.idEnvio]);
          return;
        }

        this.model.numero_tracking = envio.numero_tracking || '';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cargar el envío.');
      }
    });
  }

  /** Solo couriers reales necesitan tracking — un viaje de InDriver o un recojo
   *  presencial no lo tienen. Sin medio_envio definido, se pide por defecto. */
  get requiereTracking(): boolean {
    const medio = (this.envio?.medio_envio || '').trim().toLowerCase();
    if (!medio) return true;
    const sinTracking = ['recojo en tienda', 'indriver', 'yango'];
    return !sinTracking.some(m => medio.includes(m));
  }

  onCancel(): void {
    this.router.navigate(['/envios', this.idEnvio]);
  }

  onConfirmarDespacho(): void {
    this.uiSvc.confirm({
      title: 'Despachar Envío',
      message: 'Esto descuenta el stock real de cada artículo del paquete. ¿Confirmas el despacho?',
      confirmText: 'Despachar',
      cancelText: 'Revisar'
    }).then(ok => {
      if (!ok) return;

      this.saving = true;
      this.enviosSvc.despachar(this.idEnvio, {
        numero_tracking: this.requiereTracking ? (this.model.numero_tracking || undefined) : undefined,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.uiSvc.alert('success', 'Envío despachado', 'El stock fue descontado correctamente.');
          this.router.navigate(['/envios', this.idEnvio]);
        },
        error: (err) => {
          this.saving = false;
          this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo despachar el envío.');
        }
      });
    });
  }
}