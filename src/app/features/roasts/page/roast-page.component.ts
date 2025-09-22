import { User } from './../../../shared/models/user';
// src/app/features/roasts/page/roasts-page.component.ts
import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { X, Check, Eye, Edit, Trash } from 'lucide-angular';

import { AddRoasterComponent } from '../components/add-order-roast/add-order-roast.component';
import { Pedido } from '../../../shared/models/pedido';
import { PedidoService } from '../../orders/service/orders.service';
import { UserService } from '../../users/service/users-service.service';
import { catchError, map, Observable, of } from 'rxjs';
import { OrderRoastsComponent } from '../components/order-roasts/order-roasts.component';
import { EditRoastComponent } from '../components/edit-roast/edit-roast.component';
import { EditOrderComponent } from '../components/edit-order/edit-order.component';
import { UiService } from '../../../shared/services/ui.service';
import { LoteTostado } from '../../../shared/models/lote-tostado';
import { FichaTuesteComponent } from "../../../shared/components/ficha-tueste/ficha-tueste.component";
import { RoastsService } from '../service/roasts.service';
import { Tueste } from '../../../shared/models/tueste';
import { UserNamePipe } from "../../../shared/pipes/user-name-pipe.pipe";
import { MinSecPipe } from "../../../shared/pipes/time.pipe";

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
    EditOrderComponent,
    FichaTuesteComponent,
    UserNamePipe,
    MinSecPipe
],
  templateUrl: './roast-page.component.html',
})
export class RoastsPage {
  readonly Plus = Plus;
  readonly X = X;
  readonly Check = Check;
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash = Trash;

  pendingOrders: ExtendedPedido[] = [];
  allHistoryRoasts: ExtendedPedido[] = [];
  filteredHistoryRoasts: ExtendedPedido[] = [];
  allRoasts: Tueste[] = [];

  startDate = '';
  endDate = '';
  showAddRoaster = false;
  historyDate = '';
  historyLevel = '';
  roastLevels = ['Claro', 'Medio', 'Oscuro'];
  showRoastsModal = false;
  showEditRoastModal = false;
  showAllRoasts = false;
  selectedOrder?: Pedido;
  selectedTuesteId = '';
  showFichaTueste = false;


  constructor(
    private pedidoSvc: PedidoService,
    private roastsSvc: RoastsService,
    private userSvc: UserService,
    private uiSvc: UiService,
  ) { }

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
            () => p.userName = 'Desconocido'
          );
        });
      });
  }

  loadHistory() {
    this.pedidoSvc.getPedidosByEstado('Completado').pipe(
      map(list => list.filter(p => p.tipo_pedido === 'Orden Tueste')),
      catchError(() => of([]))
    ).subscribe(list => {
      this.allHistoryRoasts = list.map(p => ({ ...p }));
      // carga userName igual que antes...
      this.allHistoryRoasts.forEach(p =>
        this.userSvc.getUserById(p.id_user).subscribe(
          u => p.userName = u?.nombre ?? 'Desconocido',
          () => p.userName = 'Desconocido'
        )
      );
      // Aplica filtro la primera vez
      this.applyFilter();
    });
  }

  toggleAllRoasts() {
    this.showAllRoasts = !this.showAllRoasts;
    if (this.showAllRoasts) {
      this.loadAllRoasts();
    }
  }


  loadAllRoasts() {
    this.roastsSvc.getAllTuestes().subscribe(list => {
      this.allRoasts = list;
      console.log(list);
    });
  }

  onFilterChange() {
    this.applyFilter();
  }

  private applyFilter() {
    const desde = this.startDate ? new Date(this.startDate) : null;
    const hasta = this.endDate ? new Date(this.endDate) : null;
    const nivel = this.historyLevel; // e.g. "Claro"

    this.filteredHistoryRoasts = this.allHistoryRoasts.filter(h => {
      const fecha = new Date(h.fecha_tueste!);
      // rango de fechas
      const inRange =
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta);

      // nivel de tueste: el comentario es "Tueste Claro"/"Tueste Medio"/…
      const nivelMatch =
        !nivel ||
        h.comentario === `Tueste ${nivel}`;

      return inRange && nivelMatch;
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
    this.loadPending();
    this.loadHistory();
  }

  onRoasterCreated(data: any) {
    this.showAddRoaster = false;
    this.loadPending();
    this.loadHistory();
  }

  onDeleteOrder(o: Pedido) {
    this.uiSvc.confirm({
      title: 'Eliminar orden',
      message: `¿Estás seguro de que deseas eliminar la orden de tueste de ${o.id_lote}?`,
      confirmText: 'Sí',
      cancelText: 'No'
    }).then(confirmed => {
      if (confirmed) {
        this.pedidoSvc.deletePedido(o.id_pedido).subscribe(() => {
          this.loadPending();
          this.loadHistory();
        });
      }
    });
  }

  onFichaTueste(t: string) {
    this.selectedTuesteId = t;
    this.showFichaTueste = true;
  }

}
