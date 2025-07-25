import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from './../../../../shared/models/pedido';
import { DashboardService } from '../../service/dashboard.service';
import { UserService } from '../../../users/service/users-service.service';
import { User } from './../../../../shared/models/user';

@Component({
  selector: 'last-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './last-orders.component.html',
  styles: ``
})
export class LastOrdersComponent {
  pedidos: Pedido[] = [];
  cliente: string[] = [];

  constructor(
    private dashboardSvc: DashboardService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    this.dashboardSvc.getUltimosPedidos().subscribe((data: Pedido[]) => {
      this.pedidos = data;
      this.cargarClientes(data);
    });
  }

  private async cargarClientes(pedidos: Pedido[]) {
    for (let i = 0; i < pedidos.length; i++) {
      try {
        const user = await this.userSvc.getUserById(pedidos[i].id_user).toPromise();
        this.cliente[i] = user?.nombre || 'Sin nombre';
      } catch (err) {
        this.cliente[i] = 'Usuario no encontrado';
      }
    }
  }

  getBadgeColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Tostando': return 'bg-orange-100 text-orange-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
