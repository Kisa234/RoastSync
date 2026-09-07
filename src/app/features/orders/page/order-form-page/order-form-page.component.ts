import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Check, X } from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';
import { UiService } from '../../../../shared/services/ui.service';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

import { Pedido } from '../../../../shared/models/pedido';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, SelectSearchComponent],
  templateUrl: './order-form-page.component.html'
})
export class OrderFormPage implements OnInit {
  readonly Check = Check;
  readonly X = X;

  mode: 'create' | 'edit' = 'create';
  orderId: string | null = null;

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
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoSvc: PedidoService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private almacenSvc: AlmacenService,
    private uiSvc: UiService
  ) { }

  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] ?? 'create';
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.loadCatalogos();
  }

  loadCatalogos() {
    this.userSvc.getUsers().subscribe(users => {
      this.clientes = users.filter(u => u.rol === 'cliente');

      this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
        this.lotes = lotes.filter(
          lote =>
            lote.owned_by_store &&
            (this.mode === 'edit' || this.getPesoGeneral(lote) > 0)
        );

        this.almacenSvc.getAlmacenesActivos().subscribe(almacenes => {
          this.almacenes = almacenes;

          if (this.mode === 'edit' && this.orderId) {
            this.loadPedidoExistente(this.orderId);
          }
        });
      });
    });
  }
  loadPedidoExistente(id: string) {
    this.pedidoSvc.getPedidoById(id).subscribe(pedido => {
      this.model = {
        ...pedido,
        id_almacen: pedido.id_almacen || ''
      };
      this.onLoteChange(false);
      this.onAlmacenChange();
    });
  }

  // ---------- Lote / almacén ----------

  getPesoGeneral(lote: LoteVerdeConInventario): number {
    return lote.inventarioLotes.reduce((total, i) => total + (i.cantidad_kg || 0), 0);
  }

  getPesoPorAlmacen(lote: LoteVerdeConInventario, idAlmacen: string): number {
    return lote.inventarioLotes
      .filter(i => i.almacen?.id_almacen === idAlmacen)
      .reduce((total, i) => total + (i.cantidad_kg || 0), 0);
  }

  onLoteChange(resetAlmacen: boolean = true) {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (resetAlmacen) {
      this.model.id_almacen = '';
    }

    if (!loteSeleccionado) {
      this.almacenesFiltrados = [];
      this.availableQty = 0;
      return;
    }

    this.availableQty = this.getPesoGeneral(loteSeleccionado);

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
  }

  onAlmacenChange() {
    const loteSeleccionado = this.lotes.find(x => x.id_lote === this.model.id_lote);

    if (!loteSeleccionado) {
      this.availableQty = 0;
      return;
    }

    if (!this.model.id_almacen) {
      this.availableQty = this.getPesoGeneral(loteSeleccionado);
      return;
    }

    this.availableQty = this.getPesoPorAlmacen(loteSeleccionado, this.model.id_almacen);
  }

  // ---------- Guardar / cancelar ----------

  onCancel() {
    this.router.navigate(['/orders']);
  }

  onSave() {
    if (this.mode === 'create') {
      if (!this.model.tipo_pedido) {
        this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el tipo de pedido.');
        return;
      }
      if (!this.model.id_lote) {
        this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el lote.');
        return;
      }
    }

    if (!this.model.id_user) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el cliente.');
      return;
    }

    if (!this.model.id_almacen) {
      this.uiSvc.alert('warning', 'Campo requerido', 'Debes seleccionar el almacén.');
      return;
    }

    if (!this.model.cantidad || this.model.cantidad <= 0) {
      this.uiSvc.alert('warning', 'Cantidad inválida', 'Debes ingresar una cantidad mayor a 0.');
      return;
    }

    if (this.model.cantidad > this.availableQty) {
      this.uiSvc.alert(
        'error',
        'Stock insuficiente',
        `La cantidad solicitada excede la disponibilidad del almacén seleccionado. Disponible: ${this.availableQty} gr.`
      );
      return;
    }

    this.loading = true;

    if (this.mode === 'create') {
      this.crearPedido();
    } else {
      this.actualizarPedido();
    }
  }

  private crearPedido() {
    this.pedidoSvc.createPedido(this.model).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Pedido creado', 'El pedido se registró correctamente.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'No se pudo registrar el pedido.';
        this.uiSvc.alert('error', 'Error', msg);
      }
    });
  }

  private actualizarPedido() {
    if (!this.orderId) return;

    this.pedidoSvc.updatePedido(this.orderId, {
      cantidad: this.model.cantidad,
      comentario: this.model.comentario,
      id_almacen: this.model.id_almacen
    }).subscribe({
      next: () => {
        this.uiSvc.alert('success', 'Pedido actualizado', 'El pedido se actualizó correctamente.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'No se pudo actualizar el pedido.';
        this.uiSvc.alert('error', 'Error', msg);
      }
    });
  }
}