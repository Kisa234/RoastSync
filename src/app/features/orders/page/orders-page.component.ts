import { UiService } from './../../../shared/services/ui.service';
// src/app/features/orders/page/orders-page.component.ts
import { Component }                             from '@angular/core';
import {CommonModule, NgFor, AsyncPipe, DatePipe} from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { LucideAngularModule }                  from 'lucide-angular';
import { Plus, Search, Eye, Edit2, Trash2,Check }     from 'lucide-angular';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map }                                  from 'rxjs/operators';
import { Pedido } from '../../../shared/models/pedido';
import { PedidoService } from '../service/orders.service';
import { AddOrderComponent } from '../components/add-order/add-order.component';
import { EditOrderComponent } from '../components/edit-order/edit-order.component';
import { ViewOrderComponent } from '../components/view-order/view-order.component';



@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    AsyncPipe,
    DatePipe,
    LucideAngularModule,
    AddOrderComponent,
    EditOrderComponent,
    ViewOrderComponent    
  ],
  templateUrl: './orders-page.component.html',
  styles: [``]
})
export class OrdersPage {
  // íconos
  readonly Plus   = Plus;
  readonly Search = Search;
  readonly Eye    = Eye;
  readonly Edit2  = Edit2;
  readonly Trash2 = Trash2;
  readonly Check  = Check;

  // búsqueda
  filterText = '';
  private filter$ = new BehaviorSubject<string>('');

  // stream filtrado
  pedidos$!: Observable<Pedido[]>;

  // modal
  showAddOrder = false;
  showEditOrder = false;
  showViewOrder = false;
  selectedOrderId!: string;

  constructor(
    private pedidoSvc: PedidoService,
    private uiSvc: UiService
  ) {}

  ngOnInit() {
    const raw$ = this.pedidoSvc.getPedidos();
    this.pedidos$ = combineLatest([raw$, this.filter$]).pipe(
      map(([list, term]) => this.filterList(list, term))
    );
  }

  private filterList(list: Pedido[], term: string): Pedido[] {
    const q = term.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p =>
      Object.values(p).some(v =>
        `${v}`.toLowerCase().includes(q)
      )
    );
  }

  onSearchChange() {
    this.filter$.next(this.filterText);
  }

  openAdd() {
    this.showAddOrder = true;
  }

  onOrderCreated(p: Pedido) {
    this.showAddOrder = false;
    // recarga la lista
    this.pedidoSvc.getPedidos().subscribe(list => this.filter$.next(this.filterText));
  }

  onOrderEdit(p: Pedido) {
    this.showEditOrder = false;
    this.pedidoSvc.getPedidos().subscribe(list => this.filter$.next(this.filterText));
  }

  view(p: Pedido)   { 
    this.selectedOrderId = p.id_pedido;
    this.showViewOrder = true;
  }
  edit(p: Pedido)   { 
    this.selectedOrderId = p.id_pedido;
    this.showEditOrder = true;
  }

  delete(p: Pedido){
    this.uiSvc.confirm({
      title: 'Eliminar Pedido',
      message: `¿Está seguro de eliminar el pedido?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then((confirmed: boolean) => {
      if (confirmed) {
        this.pedidoSvc.deletePedido(p.id_pedido)
          .subscribe(() => this.pedidoSvc.getPedidos().subscribe(() => this.filter$.next(this.filterText)));
      }})
  }

  complete(p: Pedido) {

    this.uiSvc.confirm({
      title: 'Completar Pedido',
      message: `¿Está seguro de completar el pedido?`,
      confirmText: 'Completar',
      cancelText: 'Cancelar'
    }).then((confirmed: boolean) => {
      if (confirmed) {
        this.pedidoSvc.completarPedido(p.id_pedido)
      .subscribe(() => this.pedidoSvc.getPedidos().subscribe(() => this.filter$.next(this.filterText)));

        
      }
    })
    
  }
}
