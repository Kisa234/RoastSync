import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { OrderBolsaService } from '../../service/order-bolsa.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';

import { Pedido } from '../../../../shared/models/pedido';
import { PedidoBolsa } from '../../../../shared/models/pedido-bolsa';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';

@Component({
  selector: 'app-view-order-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    UserNamePipe
  ],
  templateUrl: './view-order.page.html',
  styles: ``
})
export class ViewOrderPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;

  orderId = '';
  breadcrumbOrigen = 'Pedidos';

  model: Partial<Pedido> = {
    tipo_pedido: '',
    cantidad: 0,
    id_user: '',
    id_lote: '',
    comentario: '',
    id_almacen: ''
  };

  isMaquila = false;

  clientes: User[] = [];
  lotes: LoteVerdeConInventario[] = [];
  almacenes: Almacen[] = [];
  almacenesFiltrados: Almacen[] = [];
  almacenNombre = '';

  bolsas: PedidoBolsa[] = [];

  availableQty = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private pedidoSvc: PedidoService,
    private orderBolsaSvc: OrderBolsaService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private almacenService: AlmacenService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.breadcrumbOrigen = this.route.snapshot.queryParamMap.get('origen') || 'Pedidos';

    if (!this.orderId) {
      console.error('No se recibió el id del pedido');
      return;
    }

    this.userSvc.getUsers().subscribe(users => {
      this.clientes = users.filter(u => u.rol === 'cliente');
      const admins = users.filter(u => u.rol === 'admin');

      this.almacenService.getAlmacenesActivos().subscribe(almacenes => {
        this.almacenes = almacenes;

        this.pedidoSvc.getPedidoById(this.orderId).subscribe(pedido => {
          this.model = { ...pedido, id_almacen: pedido.id_almacen || '' };
          this.isMaquila = pedido.tipo_pedido === 'Maquila';

          if (this.isMaquila) {
            this.loadMaquilaExtras();
          } else {
            this.loteSvc.getLotesVerdesConInventario().subscribe(lotes => {
              this.lotes = lotes.filter(lote =>
                admins.some(admin => admin.id_user === lote.id_user)
              );
              this.onLoteChange();
            });
          }
        });
      });
    });
  }

  private loadMaquilaExtras(): void {
    const almacen = this.almacenes.find(a => a.id_almacen === this.model.id_almacen);
    this.almacenNombre = almacen?.nombre || 'N/A';

    this.orderBolsaSvc.getByPedido(this.orderId).subscribe({
      next: (bolsas) => this.bolsas = bolsas,
      error: () => this.bolsas = []
    });
  }

  getAlmacenNombre(idAlmacen: string | undefined): string {
    if (!idAlmacen) return 'N/A';
    return this.almacenesFiltrados.find(a => a.id_almacen === idAlmacen)?.nombre || 'N/A';
  }

  get totalBolsas(): number {
    return this.bolsas.reduce((sum, b) => sum + (Number(b.cantidad) || 0), 0);
  }

  get totalGramosBolsas(): number {
    return this.bolsas.reduce((sum, b) => sum + (Number(b.gramaje) || 0) * (Number(b.cantidad) || 0), 0);
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

    this.availableQty = this.model.id_almacen
      ? this.getPesoPorAlmacen(loteSeleccionado, this.model.id_almacen)
      : this.getPesoGeneral(loteSeleccionado);
  }

  goBack(): void {
    this.location.back();
  }


}