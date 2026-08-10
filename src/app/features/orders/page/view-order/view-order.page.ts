import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye, Download} from 'lucide-angular';

import { PedidoService } from '../../service/orders.service';
import { OrderBolsaService } from '../../service/order-bolsa.service';
import { PedidoItemService } from '../../service/pedido-item.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { UserService } from '../../../users/service/users-service.service';
import { AlmacenService } from '../../../inventory/almacenes/service/almacen.service';

import { Pedido } from '../../../../shared/models/pedido';
import { PedidoBolsa } from '../../../../shared/models/pedido-bolsa';
import { PedidoItem } from '../../../../shared/models/pedido-item';
import { User } from '../../../../shared/models/user';
import { Almacen } from '../../../../shared/models/almacen';
import { LoteVerdeConInventario } from '../../../../shared/models/lote';
import { UserNamePipe } from '../../../../shared/pipes/user-name-pipe.pipe';
import { Tueste } from '../../../../shared/models/tueste';
import { RoastsService } from '../../../roasts/service/roasts.service';

@Component({
  selector: 'app-view-order-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UserNamePipe
  ],
  templateUrl: './view-order.page.html',
  styles: ``
})
export class ViewOrderPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly Download = Download;

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
  isDespacho = false;

  clientes: User[] = [];
  lotes: LoteVerdeConInventario[] = [];
  almacenes: Almacen[] = [];
  almacenesFiltrados: Almacen[] = [];
  almacenNombre = '';

  bolsas: PedidoBolsa[] = [];
  items: PedidoItem[] = [];

  isOrdenTueste = false;
  tuestes: Tueste[] = [];

  availableQty = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private pedidoSvc: PedidoService,
    private orderBolsaSvc: OrderBolsaService,
    private pedidoItemSvc: PedidoItemService,
    private loteSvc: LoteService,
    private userSvc: UserService,
    private almacenService: AlmacenService,
    private roastsSvc: RoastsService,
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
          this.isDespacho = pedido.tipo_pedido === 'OrdenDespacho';
          this.isOrdenTueste = pedido.tipo_pedido === 'Orden Tueste'; // 👈 nuevo

          if (this.isMaquila) {
            this.loadMaquilaExtras();
          } else if (this.isDespacho) {
            this.loadDespachoExtras();
          } else if (this.isOrdenTueste) {
            this.loadTuesteExtras();
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

  private loadTuesteExtras(): void {
    this.almacenNombre = this.almacenes.find(a => a.id_almacen === this.model.id_almacen)?.nombre || 'N/A';

    this.roastsSvc.getTuestesByPedido(this.orderId).subscribe({
      next: (tuestes) => {
        this.tuestes = [...tuestes].sort(
          (a, b) => (Number(a.num_batch) || 0) - (Number(b.num_batch) || 0)
        );
      },
      error: () => this.tuestes = []
    });
  }

  private loadMaquilaExtras(): void {
    this.almacenNombre = this.almacenes.find(a => a.id_almacen === this.model.id_almacen)?.nombre || 'N/A';

    this.orderBolsaSvc.getByPedido(this.orderId).subscribe({
      next: (bolsas) => this.bolsas = bolsas,
      error: () => this.bolsas = []
    });
  }

  private loadDespachoExtras(): void {
    this.almacenNombre = this.almacenes.find(a => a.id_almacen === this.model.id_almacen)?.nombre || 'N/A';

    this.pedidoItemSvc.getByPedido(this.orderId).subscribe({
      next: (items) => this.items = items,
      error: () => this.items = []
    });
  }

  labelEntidad(entidad: string): string {
    const labels: Record<string, string> = {
      BOLSA: 'Bolsa',
      LOTE: 'Lote (verde)',
      LOTE_TOSTADO: 'Lote Tostado',
      PRODUCTO: 'Producto',
      MUESTRA: 'Muestra',
      INSUMO: 'Insumo',
    };
    return labels[entidad] || entidad;
  }

  get totalItems(): number {
    return this.items.length;
  }

  get totalCantidadItems(): number {
    return this.items.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
  }

  get isCompletado(): boolean {
    return this.model.estado_pedido === 'Completado';
  }

  /** Tanto Venta Verde como Tostado Verde guardan el resultado en el modelo Lote:
   *  id_nuevoLote si se creó uno nuevo para el cliente, id_lote_destino si se sumó
   *  a un lote existente. id_nuevoLote_tostado es de otro flujo (Orden Tueste). */
  get idLoteResultante(): string | null {
    return this.model.id_nuevoLote || this.model.id_lote_destino || null;
  }

  verLoteResultante(): void {
    if (!this.idLoteResultante) return;
    this.router.navigate(['/inventory/lotes-verdes/historico', this.idLoteResultante]);
  }

  verLoteTostado(): void {
    if (!this.idLoteTostadoResultante) return;
    this.router.navigate(['/inventory/lotes-tostados/historico', this.idLoteTostadoResultante]);
  }

  verReporteTostado(): void {
    if (!this.idLoteTostadoResultante) return;
    this.router.navigate(['/inventory/lotes-tostados/reporte', this.idLoteTostadoResultante]);
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


  get totalBatchesCompletados(): number {
    return this.tuestes.filter(t => t.estado_tueste === 'Completado').length;
  }

  get totalPesoEntrada(): number {
    return this.tuestes.reduce((sum, t) => sum + (Number(t.peso_entrada) || 0), 0);
  }

  get totalPesoSalida(): number {
    return this.tuestes.reduce((sum, t) => sum + (Number(t.peso_salida) || 0), 0);
  }

  get idLoteTostadoResultante(): string | null {
    return this.model.id_nuevoLote_tostado || null;
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