import { Component } from '@angular/core';
import { CommonModule, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Eye, Edit2, Trash2, Check, Factory } from 'lucide-angular';
import { Pedido } from '../../../shared/models/pedido';
import { PedidoService } from '../service/orders.service';
import { UiService } from '../../../shared/services/ui.service';
import { AddOrderComponent } from '../components/add-order/add-order.component';
import { EditOrderComponent } from '../components/edit-order/edit-order.component';
import { EditMaquilaOrderComponent } from '../components/edit-maquila/edit-maquila.component';
import { ViewOrderComponent } from '../components/view-order/view-order.component';
import { UserNamePipe } from "../../../shared/pipes/user-name-pipe.pipe";
import { AddMaquilaOrderComponent } from '../components/add-maquila/add-maquila.component';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    DatePipe,
    LucideAngularModule,
    AddOrderComponent,
    AddMaquilaOrderComponent,
    EditOrderComponent,
    EditMaquilaOrderComponent,
    ViewOrderComponent,
    UserNamePipe
  ],
  templateUrl: './orders-page.component.html'
})
export class OrdersPage {
  // Íconos
  readonly Plus = Plus;
  readonly Eye = Eye;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly Factory = Factory;

  pedidos: Pedido[] = [];
  selectedOrderId!: string;
  selectedPedido: Pedido | null = null;

  showAddOrder = false;
  showAddMaquilaOrder = false;
  showEditOrder = false;
  showViewOrder = false;

  constructor(
    private pedidoSvc: PedidoService,
    private uiSvc: UiService
  ) {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.pedidoSvc.getPedidos().subscribe({
      next: (list) => {
        const filtrados = list.filter(p => p.tipo_pedido !== 'Orden Tueste');
        this.pedidos = filtrados;
      },
      error: (err) => console.error('Error cargando pedidos:', err)
    });
  }

  openAdd() {
    this.showAddOrder = true;
  }

  openAddMaquila() {
    this.showAddMaquilaOrder = true;
  }

  onOrderCreated(p: Pedido) {
    this.showAddOrder = false;
    this.getData();
  }

  onMaquilaCreated(p: Pedido) {
    this.showAddMaquilaOrder = false;
    this.getData();
  }

  view(p: Pedido) {
    this.selectedOrderId = p.id_pedido;
    this.showViewOrder = true;
  }

  edit(p: Pedido) {
    this.selectedOrderId = p.id_pedido;
    this.selectedPedido = p;
    this.showEditOrder = true;
  }

  onOrderEdit(p: Pedido) {
    this.showEditOrder = false;
    this.getData();
  }

  onMaquilaEdit(p: Pedido) {
    this.showEditOrder = false;
    this.getData();
  }

  delete(p: Pedido) {
    this.uiSvc.confirm({
      title: 'Eliminar Pedido',
      message: `¿Está seguro de eliminar este pedido?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then((ok) => {
      if (ok) {
        this.pedidoSvc.deletePedido(p.id_pedido).subscribe(() => this.getData());
      }
    });
  }

  complete(p: Pedido) {
    this.uiSvc.confirm({
      title: 'Completar Pedido',
      message: `¿Desea marcar el pedido como completado?`,
      confirmText: 'Completar',
      cancelText: 'Cancelar'
    }).then((ok) => {
      if (ok) {
        this.pedidoSvc.completarPedido(p.id_pedido).subscribe(() => this.getData());
      }
    });
  }
}
