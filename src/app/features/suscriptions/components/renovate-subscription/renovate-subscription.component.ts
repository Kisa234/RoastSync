import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from './../../../users/service/users-service.service';
import { PedidoService } from '../../../orders/service/orders.service';
import { Pedido } from '../../../../shared/models/pedido';
import { User } from '../../../../shared/models/user';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

@Component({
  selector: 'app-renovate-subscription',
  templateUrl: './renovate-subscription.component.html',
  imports: [
    CommonModule,
    FormsModule,
    UserNamePipe
  ]
})
export class RenovateSubscriptionComponent implements OnInit {

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  selectedUser: string = '';
  selectedType: string = '';

  constructor(
    private readonly userService: UserService,
    private readonly pedidoService: PedidoService
  ) { }

  payload: Partial<Pedido> = {
    id_user: '',
    tipo_pedido: 'Suscripcion',
    cantidad: 0,
    pesos: [200,200,200]
  };

  users: User[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.users = this.users.filter(user => user.rol === 'cliente');
    });
  }

  close() {
    this.onClose.emit();
  }

  save() {
    this.payload.cantidad = Number(this.payload.cantidad);
    this.pedidoService.createPedido(this.payload).subscribe(() => {
      this.onSave.emit();
    });
  }
}
