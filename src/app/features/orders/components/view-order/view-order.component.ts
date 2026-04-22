import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Check } from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';

import { Pedido } from '../../../../shared/models/pedido';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

@Component({
  selector: 'view-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UserNamePipe
  ],
  templateUrl: './view-order.component.html',
  styles: ``
})
export class ViewOrderComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() orderId!: string;

  readonly X = X;
  readonly Check = Check;

  model: Partial<Pedido> = {
    tipo_pedido: '',
    cantidad: 0,
    id_user: '',
    id_lote: '',
    comentario: '',
    id_almacen: ''
  };

  tipos = ['Venta Verde', 'Tostado Verde'];
  clientes: User[] = [];
  lotes: LoteVerdeConInventario[] = [];
  almacenes: Almacen[] = [];
  almacenesFiltrados: Almacen[] = [];

  availableQty = 0;

  constructor(
    private pedidoSvc: PedidoService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private almacenService: AlmacenService
  ) {}

  ngOnInit(): void {
    this.userSvc.getUsers().subscribe(users => {
      this.clientes = users.filter(u => u.rol === 'cliente');

      const admins = users.filter(u => u.rol === 'admin');

      this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
        this.lotes = lotes.filter(lote =>
          admins.some(admin => admin.id_user === lote.id_user)
        );

        this.almacenService.getAlmacenesActivos().subscribe(almacenes => {
          this.almacenes = almacenes;

          this.pedidoSvc.getPedidoById(this.orderId).subscribe(pedido => {
            this.model = {
              ...pedido,
              id_almacen: pedido.id_almacen || ''
            };

            this.onLoteChange();
          });
        });
      });
    });
  }

  getPesoGeneral(lote: LoteVerdeConInventario): number {
    return lote.inventarioLotes.reduce((total, i) => total + (i.cantidad_kg || 0), 0);
  }

  getPesoPorAlmacen(lote: LoteVerdeConInventario, idAlmacen: string): number {
    return lote.inventarioLotes
      .filter(i => i.almacen?.id_almacen === idAlmacen)
      .reduce((total, i) => total + (i.cantidad_kg || 0), 0);
  }

  onLoteChange(): void {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (!loteSeleccionado) {
      this.almacenesFiltrados = [];
      this.availableQty = 0;
      return;
    }

    const almacenesIdsConStock = [
      ...new Set(
        loteSeleccionado.inventarioLotes
          .map(i => i.almacen?.id_almacen)
          .filter((id): id is string => !!id)
      )
    ];

    this.almacenesFiltrados = this.almacenes.filter(a =>
      almacenesIdsConStock.includes(a.id_almacen)
    );

    if (!this.model.id_almacen) {
      this.availableQty = this.getPesoGeneral(loteSeleccionado);
      return;
    }

    this.availableQty = this.getPesoPorAlmacen(
      loteSeleccionado,
      this.model.id_almacen
    );
  }

  onCancel(): void {
    this.close.emit();
  }
}