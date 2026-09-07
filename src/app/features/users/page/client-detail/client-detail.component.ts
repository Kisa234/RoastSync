import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Mail, Phone, Package, Truck, Sprout, Flame, Eye } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

import { User } from '../../../../shared/models/user';
import { Pedido } from '../../../../shared/models/pedido';
import { EnvioConDetalle } from '../../../../shared/models/envio';
import { Lote } from '../../../../shared/models/lote';
import { LoteTostado } from '../../../../shared/models/lote-tostado';
import { UserService } from '../../service/users-service.service';
import { PedidoService } from '../../../orders/service/orders.service';
import { EnviosService } from '../../../envios/service/envios.service';
import { LoteService } from '../../../inventory/lotes-verdes/service/lote.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';

@Component({
  selector: 'client-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './client-detail.component.html',
})
export class ClientDetailComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Package = Package;
  readonly Truck = Truck;
  readonly Sprout = Sprout;
  readonly Flame = Flame;
  readonly Eye = Eye;

  cliente: User | null = null;
  pedidos: Pedido[] = [];
  envios: EnvioConDetalle[] = [];
  lotesVerdes: Lote[] = [];
  lotesTostados: LoteTostado[] = [];
  loading = true;

  tab: 'pedidos' | 'envios' | 'lotesVerdes' | 'lotesTostados' = 'pedidos';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userSvc: UserService,
    private pedidoSvc: PedidoService,
    private enviosSvc: EnviosService,
    private loteSvc: LoteService,
    private loteTostadoSvc: LoteTostadoService,
  ) { }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;
    try {
      const [cliente, pedidos, envios, lotesVerdes, lotesTostados] = await Promise.all([
        firstValueFrom(this.userSvc.getUserById(id)),
        firstValueFrom(this.pedidoSvc.getPedidosByCliente(id)),
        firstValueFrom(this.enviosSvc.getByCliente(id)),
        firstValueFrom(this.loteSvc.getByUser(id)),
        firstValueFrom(this.loteTostadoSvc.getByUser(id)),
      ]);
      this.cliente = cliente;
      this.pedidos = pedidos.sort((a, b) =>
        new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
      );
      this.envios = envios.sort((a, b) =>
        new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
      );
      this.lotesVerdes = lotesVerdes.sort((a, b) =>
        new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
      );
      this.lotesTostados = lotesTostados.sort((a, b) =>
        new Date(b.fecha_tostado).getTime() - new Date(a.fecha_tostado).getTime()
      );
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  estadoEnvioClass(estado: string): string {
    switch (estado) {
      case 'ENTREGADO': return 'bg-green-100 text-green-800';
      case 'CANCELADO':
      case 'DEVUELTO': return 'bg-red-100 text-red-800';
      case 'DESPACHADO':
      case 'EN_TRANSITO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  estadoPedidoClass(estado: string): string {
    return estado === 'Completado'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  }

  // ── Paginación genérica (misma lógica para las 4 tablas) ──
  pagePedidos = 1;
  pageEnvios = 1;
  pageLotesVerdes = 1;
  pageLotesTostados = 1;
  readonly pageSize = 10;

  private paginate<T>(list: T[], page: number): T[] {
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
  private totalPages(length: number): number {
    return Math.ceil(length / this.pageSize) || 1;
  }

  get pagedPedidos() { return this.paginate(this.pedidos, this.pagePedidos); }
  get totalPagesPedidos() { return this.totalPages(this.pedidos.length); }

  get pagedEnvios() { return this.paginate(this.envios, this.pageEnvios); }
  get totalPagesEnvios() { return this.totalPages(this.envios.length); }

  get pagedLotesVerdes() { return this.paginate(this.lotesVerdes, this.pageLotesVerdes); }
  get totalPagesLotesVerdes() { return this.totalPages(this.lotesVerdes.length); }

  get pagedLotesTostados() { return this.paginate(this.lotesTostados, this.pageLotesTostados); }
  get totalPagesLotesTostados() { return this.totalPages(this.lotesTostados.length); }

  verPedido(p: Pedido): void {
    this.router.navigate(['/orders', p.id_pedido]);
  }

  verEnvio(e: EnvioConDetalle): void {
    this.router.navigate(['/envios', e.id_envio]);
  }

  verLoteVerde(l: Lote): void {
    this.router.navigate(['/inventory/lotes-verdes/historico', l.id_lote]);
  }

  verLoteTostado(l: LoteTostado): void {
    this.router.navigate(['/inventory/lotes-tostados/reporte', l.id_lote_tostado]);
  }
}