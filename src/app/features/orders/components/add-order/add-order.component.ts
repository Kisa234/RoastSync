// src/app/features/orders/components/add-order/add-order.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check }        from 'lucide-angular';
import { Pedido }          from '../../../../shared/models/pedido';
import { Lote }            from '../../../../shared/models/lote';
import { User }            from '../../../../shared/models/user';
import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { SelectSearchComponent } from "../../../../shared/components/select-search/select-search.component";

@Component({
  selector: 'add-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SelectSearchComponent
],
  templateUrl: './add-order.component.html'
})
export class AddOrderComponent implements OnInit {
  @Output() close  = new EventEmitter<void>();
  @Output() create = new EventEmitter<Pedido>();

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
  this.userSvc.getUsers().subscribe(users => {
    // Usuarios cliente
    this.clientes = users.filter(u => u.rol === 'cliente');

    // Usuarios admin para filtrar lotes
    const admins = users.filter(u => u.rol === 'admin');

    this.loteSvc.getAll().subscribe(lotes => {
      this.lotes = lotes.filter(lote =>
        admins.some(admin => admin.id_user === lote.id_user)
      );
    });
  });
}

  onLoteChange() {
    const sel = this.lotes.find(x => x.id_lote === this.model.id_lote);
    this.availableQty = sel ? sel.peso : 0;
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    console.log(this.model);
    if (!this.model.tipo_pedido || !this.model.cantidad || !this.model.id_user || !this.model.id_lote) {
      return; 
    }
    this.pedidoSvc.createPedido(this.model).subscribe(p => {
      this.create.emit(p);
      this.close.emit();
    });
  }
}
