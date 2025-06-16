import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { User } from '../../../../shared/models/user';
import { Lote } from '../../../../shared/models/lote';
import { Check, LucideAngularModule, X } from 'lucide-angular';
import { Pedido } from '../../../../shared/models/pedido';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'view-order',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
  ],
  templateUrl: './view-order.component.html',
  styles: ``
})
export class ViewOrderComponent {
  @Output() close  = new EventEmitter<void>();
  @Input() orderId!: string;

  // íconos
  readonly X     = X;
  readonly Check = Check;

  // modelo
  model: Partial<Pedido> = {
    tipo_pedido: '',
    cantidad: 0,
    id_user: '',
    id_lote: '',
    comentario: ''
  };

  // listas
  tipos = ['Venta Verde', 'Tostado Verde'];
  clientes: User[] = [];
  lotes:    Lote[] = [];

  availableQty = 0;

  constructor(
    private pedidoSvc: PedidoService,
    private loteSvc:   LoteService,
    private userSvc:   UserService
  ) {}

  ngOnInit() {
    this.userSvc.getUsers().subscribe(u => this.clientes = u);
    this.loteSvc.getAll().subscribe(l => this.lotes = l);
    this.pedidoSvc.getPedidoById(this.orderId).subscribe(pedido => {
      this.model = pedido;
      this.onLoteChange(); 
    });
  }

  onLoteChange() {
    const sel = this.lotes.find(x => x.id_lote === this.model.id_lote);
    this.availableQty = sel ? sel.peso : 0;
  }

  onCancel() {
    this.close.emit();
  }

 
}
