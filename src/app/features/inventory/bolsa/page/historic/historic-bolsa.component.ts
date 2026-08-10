import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye, Truck } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { BolsaConInventario } from '../../../../../shared/models/bolsa';
import { Historial } from '../../../../../shared/models/historial';
import { LoteTostadoConInventario } from '../../../../../shared/models/lote-tostado';
import { Envio } from '../../../../../shared/models/envio';

import { BolsaService } from '../../service/bolsa.service';
import { LoteTostadoService } from '../../../lotes-tostados/service/lote-tostado.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { EnviosService } from '../../../../envios/service/envios.service';

type RegistroActividad =
  | { tipo: 'HISTORIAL'; accion: string; comentario: string; usuarioId: string; fecha: string | Date; id_pedido: string | null; id_envio: null }
  | { tipo: 'ENVIO'; accion: string; comentario: string; usuarioId: string; fecha: string | Date; id_pedido: null; id_envio: string };

@Component({
  selector: 'historic-bolsa',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    UserNamePipe,
    LucideAngularModule,
  ],
  templateUrl: './historic-bolsa.component.html',
})
export class HistoricBolsaComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly Truck = Truck;

  bolsaId = '';
  historiales: Historial[] = [];
  envios: Envio[] = [];
  registros: RegistroActividad[] = [];

  bolsa: BolsaConInventario = {
    id_bolsa: '',
    id_lote_tostado: '',
    id_pedido: '',
    gramaje: 0,
    molienda: '',
    cantidad: 0,
    fecha_embolsado: new Date(),
    eliminado: false,
    inventarios: []
  };

  loteTostado: LoteTostadoConInventario | null = null;
  responsableEmbolsadoId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly bolsaSvc: BolsaService,
    private readonly loteTostadoSvc: LoteTostadoService,
    private readonly historialService: HistorialService,
    private readonly pedidoSvc: PedidoService,
    private readonly enviosSvc: EnviosService,
  ) {}

  ngOnInit(): void {
    this.bolsaId = this.route.snapshot.paramMap.get('id_bolsa') || '';

    if (!this.bolsaId) {
      console.error('No se recibió el id de la bolsa');
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.bolsaSvc.getConInventarioById(this.bolsaId).subscribe({
      next: (bolsa: any) => {
        this.bolsa = {
          ...bolsa,
          inventarios: bolsa.inventarioBolsas ?? bolsa.inventarios ?? []
        };

        if (this.bolsa.id_lote_tostado) {
          this.loadLoteTostado(this.bolsa.id_lote_tostado);
        }

        if (this.bolsa.id_pedido) {
          this.loadResponsableEmbolsado(this.bolsa.id_pedido);
        }
      },
      error: (err) => console.error('Error al cargar bolsa con inventario:', err)
    });

    forkJoin({
      historial: this.historialService.getByEntidad(this.bolsaId),
      envios: this.enviosSvc.getEnviosPorEntidad('BOLSA', this.bolsaId),
    }).subscribe({
      next: ({ historial, envios }) => {
        this.historiales = historial ?? [];
        this.envios = envios ?? [];
        this.buildRegistros();
      },
      error: (err) => console.error('Error al cargar actividad de la bolsa:', err)
    });
  }

  private buildRegistros(): void {
    const historialMapeado: RegistroActividad[] = this.historiales.map(h => ({
      tipo: 'HISTORIAL',
      accion: h.accion,
      comentario: h.comentario || '—',
      usuarioId: h.id_user,
      fecha: h.fecha_registro,
      id_pedido: h.id_pedido || null,
      id_envio: null,
    }));

    const enviosMapeados: RegistroActividad[] = this.envios.map(e => ({
      tipo: 'ENVIO',
      accion: e.numero_correlativo,
      comentario: `Estado: ${e.estado}${e.medio_envio ? ' · ' + e.medio_envio : ''}`,
      usuarioId: e.registrado_por_id,
      fecha: e.fecha_registro,
      id_pedido: null,
      id_envio: e.id_envio,
    }));

    this.registros = [...historialMapeado, ...enviosMapeados]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  loadLoteTostado(idLoteTostado: string): void {
    this.loteTostadoSvc.getLoteTostadoConInventario(idLoteTostado).subscribe({
      next: (lt) => this.loteTostado = lt,
      error: (err) => console.error('Error al cargar lote tostado de origen:', err)
    });
  }

  loadResponsableEmbolsado(idPedido: string): void {
    this.pedidoSvc.getPedidoById(idPedido).subscribe({
      next: (pedido) => {
        this.responsableEmbolsadoId = pedido.completado_por_id || pedido.creado_por_id || '';
      },
      error: (err) => console.error('Error al cargar pedido de origen de la bolsa:', err)
    });
  }

  get clienteId(): string {
    return this.bolsa.id_user || '';
  }

  get loteVerdeId(): string {
    return this.loteTostado?.id_lote || '';
  }

  get stockTotal(): number {
    return (this.bolsa.inventarios || []).reduce((total, inv) => total + (inv.cantidad || 0), 0);
  }

  get subtotalGramos(): number {
    return (this.bolsa.gramaje || 0) * (this.bolsa.cantidad || 0);
  }

  openPedido(idPedido: string | null | undefined): void {
    if (!idPedido) return;
    this.router.navigate(['/orders', idPedido], {
      queryParams: { origen: `Bolsa ${this.bolsaId}` }
    });
  }

  openEnvio(idEnvio: string | null | undefined): void {
    if (!idEnvio) return;
    this.router.navigate(['/envios', idEnvio]);
  }

  goBack(): void {
    this.location.back();
  }
}