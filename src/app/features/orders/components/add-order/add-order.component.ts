import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check } from 'lucide-angular';
import { Pedido } from '../../../../shared/models/pedido';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { User } from '../../../../shared/models/user';
import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { Almacen } from '../../../../shared/models/almacen';
import { UiService } from '../../../../shared/services/ui.service';

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
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<Pedido>();

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

  ngOnInit() {
    this.userSvc.getUsers().subscribe(users => {
      this.clientes = users.filter(u => u.rol === 'cliente');

      const admins = users.filter(u => u.rol === 'admin');

      this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
        this.lotes = lotes.filter(lote =>
          admins.some(admin => admin.id_user === lote.id_user)
        );
      });
    });

    this.almacenService.getAlmacenesActivos().subscribe(a => {
      this.almacenes = a;
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

  onLoteChange() {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    // limpiar almacén al cambiar lote
    this.model.id_almacen = '';

    if (!loteSeleccionado) {
      this.almacenesFiltrados = [];
      this.availableQty = 0;
      return;
    }

    // disponibilidad general
    this.availableQty = this.getPesoGeneral(loteSeleccionado);

    // ids de almacenes donde sí existe inventario para ese lote
    const almacenesIdsConStock = [
      ...new Set(
        loteSeleccionado.inventarioLotes
          .map(i => i.almacen?.id_almacen)
          .filter((id): id is string => !!id)
      )
    ];

    // filtrar almacenes activos que sí estén en inventario del lote
    this.almacenesFiltrados = this.almacenes.filter(a =>
      almacenesIdsConStock.includes(a.id_almacen)
    );
  }

  onAlmacenChange() {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (!loteSeleccionado) {
      this.availableQty = 0;
      return;
    }

    // si no hay almacén seleccionado, mostrar total general
    if (!this.model.id_almacen) {
      this.availableQty = this.getPesoGeneral(loteSeleccionado);
      return;
    }

    // si hay almacén, mostrar disponibilidad de ese almacén
    this.availableQty = this.getPesoPorAlmacen(
      loteSeleccionado,
      this.model.id_almacen
    );
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (!this.model.tipo_pedido) {
      this.uiService.alert('warning', 'Campo requerido', 'Debes seleccionar el tipo de pedido.');
      return;
    }

    if (!this.model.id_user) {
      this.uiService.alert('warning', 'Campo requerido', 'Debes seleccionar el cliente.');
      return;
    }

    if (!this.model.id_lote) {
      this.uiService.alert('warning', 'Campo requerido', 'Debes seleccionar el lote.');
      return;
    }

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
        `La cantidad solicitada excede la disponibilidad del almacén seleccionado. Disponible: ${this.availableQty} kg.`
      );
      return;
    }

    this.pedidoSvc.createPedido(this.model).subscribe({
      next: (p) => {
        this.uiService.alert('success', 'Pedido creado', 'El pedido se registró correctamente.');
        this.create.emit(p);
        this.close.emit();
      },
      error: () => {
        this.uiService.alert('error', 'Error', 'No se pudo registrar el pedido.');
      }
    });
  }
}