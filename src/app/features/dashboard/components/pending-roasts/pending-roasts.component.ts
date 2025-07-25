import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';
import { differenceInCalendarDays } from 'date-fns';
import { Pedido } from '../../../../shared/models/pedido';

@Component({
  selector: 'pending-roasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-roasts.component.html',
  styles: ``
})
export class PendingRoastsComponent {
  tuestes: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getTuestesPendientes().subscribe((data: Pedido[]) => {
      this.procesarTuestes(data);
    });
  }

  private async procesarTuestes(data: Pedido[]) {
    const resultado: any[] = [];

    for (const pedido of data.filter(p => p.tipo_pedido === 'Orden Tueste')) {
      const user = await this.userService.getUserById(pedido.id_user).toPromise();
      resultado.push({
        codigo: pedido.id_pedido.slice(0, 4).toUpperCase(),
        prioridad: this.getPrioridadFromCantidad(pedido.cantidad),
        cliente: user?.nombre || 'Cliente',
        lote: pedido.id_lote,
        peso: pedido.cantidad,
        tueste: pedido.comentario || 'Desconocido',
        entrega: this.formatEntrega(pedido.fecha_tueste)
      });
    }

    this.tuestes = resultado;
  }

  getPrioridadFromCantidad(cantidad: number): string {
    if (cantidad >= 20) return 'Alta';
    if (cantidad >= 10) return 'Media';
    return 'Baja';
  }

  getDuracionEstimado(cantidad: number): string {
    const minutos = cantidad * 9;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}min`;
  }

  formatEntrega(fecha: Date | string | undefined): string {
    if (!fecha) return 'Sin fecha';
    const hoy = new Date();
    const f = new Date(fecha);
    const diff = differenceInCalendarDays(f, hoy);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `${diff} días`;
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
