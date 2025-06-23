import { User } from './../../../shared/models/user';
// src/app/features/roasts/page/roasts-page.component.ts
import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { X, Check, Eye, Edit } from 'lucide-angular';

import { AddRoasterComponent } from '../components/add-order-roast/add-order-roast.component';
import { Pedido } from '../../../shared/models/pedido';
import { PedidoService } from '../../orders/service/orders.service';
import { UserService } from '../../users/service/users-service.service';
import { catchError, map, Observable, of } from 'rxjs';
import { OrderRoastsComponent } from '../components/order-roasts/order-roasts.component';
import { EditRoastComponent } from '../components/edit-roast/edit-roast.component';
import { EditOrderComponent } from '../components/edit-order/edit-order.component';

interface ExtendedPedido extends Pedido {
  userName?: string;
}

@Component({
  selector: 'roasts-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    LucideAngularModule,
    AddRoasterComponent,
    OrderRoastsComponent,
    // EditOrderComponent
  ],
  templateUrl: './roast-page.component.html',
})
export class RoastsPage {
  readonly Plus   = Plus;
  readonly X      = X;
  readonly Check  = Check;
  readonly Eye  = Eye;
  readonly Edit  = Edit;
  
  pendingOrders: ExtendedPedido[] = [];
  historyRoasts: ExtendedPedido[]   = [];
  roastLevels = ['Claro', 'Medio', 'Oscuro'];

  showAddRoaster = false;
  historyDate   = '';
  historyLevel  = '';
  showRoastsModal = false;
  showEditRoastModal = false;
  selectedOrder?: Pedido;

  constructor(
    private pedidoSvc: PedidoService,
    private userSvc: UserService,
  ) {}

  ngOnInit() {
    this.loadPending();
    this.loadHistory();
  }

  private loadPending() {
    this.pedidoSvc.getPedidosByEstado('Pendiente')
      .pipe(
        map(list => list.filter(p => p.tipo_pedido === 'Orden Tueste'))
      )
      .subscribe(list => {
        // Copiamos en ExtendedPedido[]
        this.pendingOrders = list.map(p => ({ ...p }));
        // Por cada pedido, pedimos el nombre
        this.pendingOrders.forEach(p => {
          this.userSvc.getUserById(p.id_user).subscribe(
            user => p.userName = user?.nombre || 'Desconocido',
            ()   => p.userName = 'Desconocido'
          );
        });
      });
  }

  loadHistory() {
    this.pedidoSvc.getPedidosByEstado('Completado')
      .pipe(
        map(list => list.filter(p => p.tipo_pedido === 'Orden Tueste')),
        catchError(() => of([])) // Manejo de errores
      )
      .subscribe(list => {
        this.historyRoasts = list.map(p => ({ ...p }));
        // Por cada pedido, pedimos el nombre
        this.historyRoasts.forEach(p => {
          this.userSvc.getUserById(p.id_user).subscribe(
            user => p.userName = user?.nombre || 'Desconocido',
            ()   => p.userName = 'Desconocido'
          );
        });
      });
  }

  openAddRoaster() {
    this.showAddRoaster = true;
  }

  openRoasts(o: Pedido) {
    this.selectedOrder = o;
    this.showRoastsModal = true;
  }

  onEditRoast(o: Pedido) {
    this.selectedOrder = o;
    this.showEditRoastModal = true;
  }

  onRoasterCreated(data: any) {
    // refresca datos si hace falta
    this.showAddRoaster = false;
  }
}
