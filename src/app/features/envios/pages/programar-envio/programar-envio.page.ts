import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Calendar } from 'lucide-angular';

import { EnviosService } from '../../service/envios.service';
import { UiService } from '../../../../shared/services/ui.service';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

import { EnvioConDetalle } from '../../../../shared/models/envio';
import { EstadoEnvio } from '../../../../shared/enum/estado-envio.enum';

@Component({
  selector: 'app-programar-envio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UserNamePipe],
  templateUrl: './programar-envio.page.html'
})
export class ProgramarEnvioPage implements OnInit {
  readonly Check = Check;
  readonly Calendar = Calendar;

  readonly mediosEnvioSugeridos = ['Recojo en tienda', 'Olva Courier', 'Shalom', 'InDriver', 'Yango'];

  idEnvio = '';
  envio: EnvioConDetalle | null = null;
  loading = false;
  saving = false;

  model = {
    fecha_programada: '',
    medio_envio: '',
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

        if (envio.estado !== EstadoEnvio.PENDIENTE) {
          this.loading = false;
          this.uiSvc.alert('warning', 'No disponible', 'Solo se puede programar un envío en estado Pendiente.');
          this.router.navigate(['/envios', this.idEnvio]);
          return;
        }

        // Precarga lo que ya se haya elegido al crear el envío — evita pedirlo dos veces.
        this.model.medio_envio = envio.medio_envio || '';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo cargar el envío.');
      }
    });
  }

  canSave(): boolean {
    return !!this.model.fecha_programada;
  }

  onCancel(): void {
    this.router.navigate(['/envios', this.idEnvio]);
  }

  onSave(): void {
    if (!this.canSave()) {
      this.uiSvc.alert('warning', 'Fecha requerida', 'Selecciona la fecha programada de despacho.');
      return;
    }

    this.saving = true;
    this.enviosSvc.programar(this.idEnvio, {
      fecha_programada: this.model.fecha_programada,
      medio_envio: this.model.medio_envio || undefined,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.uiSvc.alert('success', 'Envío programado', 'El envío quedó programado correctamente.');
        this.router.navigate(['/envios', this.idEnvio]);
      },
      error: (err) => {
        this.saving = false;
        this.uiSvc.alert('error', 'Error', err?.error?.error || 'No se pudo programar el envío.');
      }
    });
  }
}