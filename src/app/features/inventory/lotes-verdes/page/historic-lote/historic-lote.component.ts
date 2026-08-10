import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Eye, Truck } from 'lucide-angular';
import { UserNamePipe } from '../../../../../shared/pipes/user-name-pipe.pipe';
import { Pedido } from '../../../../../shared/models/pedido';
import { LoteVerdeConInventario } from '../../../../../shared/models/lote';
import { Historial } from '../../../../../shared/models/historial';
import { Envio } from '../../../../../shared/models/envio';
import { LoteService } from '../../service/lote.service';
import { PedidoService } from '../../../../orders/service/orders.service';
import { HistorialService } from '../../../../../shared/services/historial.service';
import { EnviosService } from '../../../../envios/service/envios.service';
import { AlmacenService } from '../../../almacenes/service/almacen.service';

type TipoFiltro = 'TODOS' | 'HISTORIAL' | 'PEDIDO' | 'ENVIO';
interface RegistroVista {
  tipo: 'HISTORIAL' | 'PEDIDO' | 'ENVIO';
  accion: string;
  comentario: string;
  usuario: string;
  fecha: string | Date;
  raw: Historial | Pedido | Envio;
  tipoPedido?: string;
}

@Component({
  selector: 'historic-lote',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    UserNamePipe,
    LucideAngularModule,
  ],
  templateUrl: './historic-lote.component.html',
})
export class HistoricLote implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly Truck = Truck;
  loteId = '';
  pedidos: Pedido[] = [];
  historial: Historial[] = [];
  envios: Envio[] = [];
  registros: RegistroVista[] = [];
  filtroTipo: TipoFiltro = 'TODOS';
  filtroTipoPedido: string = 'TODOS';
  page = 1;
  pageSize = 5;

  private nombresAlmacen = new Map<string, string>();

  lote: LoteVerdeConInventario = {
    id_lote: '',
    proveedor: '',
    productor: '',
    finca: '',
    distrito: '',
    departamento: '',
    peso: 0,
    variedades: [],
    proceso: '',
    tipo_lote: '',
    fecha_registro: new Date(),
    eliminado: false,
    clasificacion: '',
    costo: 0,
    altura: 0,
    id_user: '',
    id_analisis: '',
    peso_tostado: 0,
    inventarioLotes: []
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly loteSvc: LoteService,
    private readonly pedidoSvc: PedidoService,
    private readonly historialService: HistorialService,
    private readonly enviosSvc: EnviosService,
    private readonly almacenSvc: AlmacenService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.loteId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.loteId) {
      console.error('No se recibió el id del lote');
      return;
    }
    this.loadLote();
    this.loadPedidos();
    this.loadHistorial();
    this.loadEnvios();
  }

  loadLote(): void {
    this.loteSvc.getLoteVerdeConInventarioById(this.loteId).subscribe({
      next: (lote) => {
        this.lote = {
          ...lote,
          inventarioLotes: lote.inventarioLotes ?? [],
          variedades: lote.variedades ?? []
        };
      },
      error: (err) => console.error('Error al cargar lote con inventario:', err)
    });
  }

  loadPedidos(): void {
    this.pedidoSvc.getPedidosByLote(this.loteId).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos ?? [];
        this.buildRegistros();
      },
      error: (err) => console.error('Error al cargar pedidos del lote:', err)
    });
  }

  loadHistorial(): void {
    this.historialService.getByEntidad(this.loteId).subscribe({
      next: (historial) => {
        this.historial = historial ?? [];
        this.buildRegistros();
      },
      error: (err) => console.error('Error al cargar historial del lote:', err)
    });
  }

  loadEnvios(): void {
    this.enviosSvc.getEnviosPorEntidad('LOTE', this.loteId).subscribe({
      next: (envios) => {
        this.envios = envios ?? [];
        this.buildRegistros();
      },
      error: (err) => console.error('Error al cargar envíos del lote:', err)
    });
  }

  private buildRegistros(): void {
    const historialMapeado: RegistroVista[] = (this.historial ?? []).map(h => ({
      tipo: 'HISTORIAL',
      accion: h.accion,
      comentario: h.comentario || 'N/A',
      usuario: h.id_user,
      fecha: h.fecha_registro,
      raw: h
    }));
    const pedidosMapeados: RegistroVista[] = (this.pedidos ?? []).map(p => ({
      tipo: 'PEDIDO',
      accion: p.tipo_pedido,
      tipoPedido: p.tipo_pedido,
      comentario: this.getPedidoComentario(p),
      usuario: (p as any).id_user || '',
      fecha: (p as any).fecha_registro,
      raw: p
    }));
    const enviosMapeados: RegistroVista[] = (this.envios ?? []).map(e => ({
      tipo: 'ENVIO',
      accion: this.labelEstadoEnvio(e.estado),
      comentario: `${e.numero_correlativo}${e.medio_envio ? ' · ' + e.medio_envio : ''}`,
      usuario: e.registrado_por_id,
      fecha: e.fecha_entrega_real || e.fecha_despacho_real || e.fecha_registro,
      raw: e
    }));
    this.registros = [...historialMapeado, ...pedidosMapeados, ...enviosMapeados]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    this.page = 1;
  }

  labelEstadoEnvio(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Creado',
      PROGRAMADO: 'Programado',
      DESPACHADO: 'Despachado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      DEVUELTO: 'Devuelto',
    };
    return labels[estado] || estado;
  }

  /** Parsea comentarios viejos de TRASLADO que aún tienen UUIDs incrustados
   *  ("...del almacén <uuid> al <uuid>") y los reemplaza por nombres reales.
   *  Comentarios nuevos (sin UUIDs) pasan intactos. */
  comentarioResuelto(r: RegistroVista): string {
    const texto = r.comentario || '';
    const regex = /del almacén ([0-9a-f-]{36}) al ([0-9a-f-]{36})/i;
    const match = texto.match(regex);
    if (!match) return texto;

    const [, idOrigen, idDestino] = match;
    const nombreOrigen = this.resolverNombreAlmacen(idOrigen);
    const nombreDestino = this.resolverNombreAlmacen(idDestino);

    return texto.replace(regex, `del almacén ${nombreOrigen} al ${nombreDestino}`);
  }

  private resolverNombreAlmacen(idAlmacen: string): string {
    if (this.nombresAlmacen.has(idAlmacen)) {
      return this.nombresAlmacen.get(idAlmacen)!;
    }

    // Placeholder mientras resuelve — se actualiza cuando llega la respuesta real.
    this.nombresAlmacen.set(idAlmacen, idAlmacen);

    this.almacenSvc.getNombre(idAlmacen).subscribe(nombre => {
      this.nombresAlmacen.set(idAlmacen, nombre || idAlmacen);
    });

    return this.nombresAlmacen.get(idAlmacen)!;
  }

  onFiltroChange(): void {
    this.page = 1;
  }

  onFiltroTipoPedidoChange(): void {
    if (this.filtroTipoPedido !== 'TODOS') {
      this.filtroTipo = 'PEDIDO';
    }
    this.page = 1;
  }

  get registrosFiltrados(): RegistroVista[] {
    if (this.filtroTipo === 'TODOS') return this.registros;
    if (this.filtroTipo === 'HISTORIAL') return this.registros.filter(r => r.tipo === 'HISTORIAL');
    if (this.filtroTipo === 'ENVIO') return this.registros.filter(r => r.tipo === 'ENVIO');
    if (this.filtroTipo === 'PEDIDO') {
      return this.registros.filter(r => {
        if (r.tipo !== 'PEDIDO') return false;
        if (this.filtroTipoPedido === 'TODOS') return true;
        return (r.accion || '').trim().toUpperCase() === this.filtroTipoPedido;
      });
    }
    return this.registros;
  }

  getPedidoComentario(p: Pedido): string {
    return `pedido de ${p.cantidad} gr`;
  }

  get registrosPaginados(): RegistroVista[] {
    const start = (this.page - 1) * this.pageSize;
    return this.registrosFiltrados.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.registrosFiltrados.length / this.pageSize));
  }

  get pesoTotalInventarios(): number {
    return (this.lote.inventarioLotes || []).reduce((total, inv) => total + (inv.cantidad_kg || 0), 0);
  }

  get pesoTotalTostadoInventarios(): number {
    return (this.lote.inventarioLotes || []).reduce((total, inv) => total + (inv.cantidad_tostado_kg || 0), 0);
  }

  getHistorialFromRegistro(r: RegistroVista): Historial | null {
    return r.tipo === 'HISTORIAL' ? (r.raw as Historial) : null;
  }

  openRegistroHistorial(r: RegistroVista): void {
    const historial = this.getHistorialFromRegistro(r);
    if (!historial) return;
    this.router.navigate(['/historial', historial.id_historial]);
  }

  openPedido(registro: RegistroVista): void {
    const pedido = registro.raw as Pedido;
    if (!pedido?.id_pedido) return;
    this.router.navigate(['/orders', pedido.id_pedido], {
      queryParams: { origen: `Lote ${this.loteId}`, origenUrl: this.router.url }
    });
  }

  openEnvio(registro: RegistroVista): void {
    const envio = registro.raw as Envio;
    if (!envio?.id_envio) return;
    this.router.navigate(['/envios', envio.id_envio]);
  }

  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  goBack(): void {
    this.location.back();
  }
}