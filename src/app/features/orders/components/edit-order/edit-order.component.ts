import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Check, LucideAngularModule, X } from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { UiService } from '../../../../shared/services/ui.service';

import { User } from '../../../../shared/models/user';
import { Pedido } from '../../../../shared/models/pedido';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';

@Component({
  selector: 'edit-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
  ],
  templateUrl: './edit-order.component.html',
  styles: ``
})
export class EditOrderComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Pedido>();
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
    private almacenService: AlmacenService,
    private uiService: UiService
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

            this.onLoteChange(false);
            this.onAlmacenChange();
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

  onLoteChange(resetAlmacen: boolean = true): void {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (resetAlmacen) {
      this.model.id_almacen = '';
    }

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

  onAlmacenChange(): void {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (!loteSeleccionado) {
      this.availableQty = 0;
      return;
    }

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

  onSave(): void {
    if (!this.model.id_almacen) {
      this.uiService.alert('warning', 'Campo requerido', 'Debes seleccionar el almacén.');
      return;
    }

    if (!this.model.cantidad || this.model.cantidad <= 0) {
      this.uiService.alert('warning', 'Cantidad inválida', 'Debes ingresar una cantidad mayor a 0.');
      return;
    }

    if (this.model.cantidad > this.availableQty) {
      this.uiService.alert(
        'error',
        'Stock insuficiente',
        `La cantidad solicitada excede la disponibilidad del almacén seleccionado. Disponible: ${this.availableQty} gr.`
      );
      return;
    }

    this.pedidoSvc.updatePedido(this.orderId, {
      cantidad: this.model.cantidad,
      comentario: this.model.comentario,
      id_almacen: this.model.id_almacen
    }).subscribe({
      next: (p) => {
        this.uiService.alert('success', 'Pedido actualizado', 'El pedido se actualizó correctamente.');
        this.edit.emit(p);
        this.close.emit();
      },
      error: () => {
        this.uiService.alert('error', 'Error', 'No se pudo actualizar el pedido.');
      }
    });
  }
}