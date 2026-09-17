import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { differenceInCalendarDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import { DashboardService, StockVerdeResponse } from '../../service/dashboard.service';
import { LoteTostadoService } from '../../../inventory/lotes-tostados/service/lote-tostado.service';
import { UserService } from '../../../users/service/users-service.service';
import { PedidoService } from '../../../orders/service/orders.service';

import { LoteTostadoConInventario } from '../../../../shared/models/lote-tostado';
import { Pedido } from '../../../../shared/models/pedido';
import { EstadisticasTueste } from '../../../../shared/models/estadisticas-tueste';
import { User } from '../../../../shared/models/user';

interface ClasificacionBar {
  nombre: string;
  kg: number;
  porcentaje: number;
  color: string;
}

interface PieSegment {
  d: string;
  color: string;
}

interface LoteUrgente {
  id_lote_tostado: string;
  tipo: string;
  kg: number;
  dias: number;
}

interface TuesteItem {
  cliente: string;
  peso: number;
  tueste: string;
  entrega: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styles: [':host { display: block; }']
})
export class OverviewComponent implements OnInit {

  // Paginador
  paginaActual = 0;
  totalPaginas = 3;
  paginas = [0, 1, 2];

  // Fecha
  fechaHoy = '';
  mesActual = '';

  // Página 1 — Inventario (Stock = café VERDE; el resto de esta sección sigue siendo tostado)
  stockTotal = 0;
  stockAdmin = 0;
  stockClientes = 0;
  totalLotesActivos = 0;
  lotesUrgentes = 0;
  clasificaciones: ClasificacionBar[] = [];
  lotesTostadosUrgentes: LoteUrgente[] = [];
  pieSegments: PieSegment[] = [];
  stockTotalVerdes = 0;

  // Página 2 — Pedidos
  tuestes: TuesteItem[] = [];
  pedidos: Pedido[] = [];
  clientesMap: Record<string, string> = {};
  totalPendientes = 0;
  pedidosCompletadosMes = 0;
  kgDespachados = 0;

  // Página 3 — Estadísticas
  estadisticas: EstadisticasTueste | null = null;

  private readonly CLASIFICACION_COLORS: Record<string, string> = {
    'Selecto': '#1D9E75',
    'Especial': '#378ADD',
    'Exclusivo': '#8B5CF6',
    'Clasico': '#EF9F27',
    'Gourmet': '#EC4899',
    // cualquier otro valor (incl. "Sin clasificar") cae al gris por defecto
  };

  constructor(
    private dashboardSvc: DashboardService,
    private loteTostadoSvc: LoteTostadoService,
    private userSvc: UserService,
    private pedidoSvc: PedidoService,
  ) { }

  ngOnInit(): void {
    this.fechaHoy = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
    this.mesActual = format(new Date(), "MMMM yyyy", { locale: es });
    this.cargarTodo();
  }

  private cargarTodo(): void {
    const hoy = new Date();
    const desde = format(startOfMonth(hoy), 'yyyy-MM-dd');
    const hasta = format(endOfMonth(hoy), 'yyyy-MM-dd');

    forkJoin({
      lotesTostados: this.loteTostadoSvc.getLotesTostadosConInventario(),
      clasificacion: this.dashboardSvc.getStockLotesPorClasificacion(),
      pedidos: this.pedidoSvc.getPedidos(),
      tuestes: this.pedidoSvc.getPedidosOrdenTueste(),
      estadisticas: this.pedidoSvc.getEstadisticasTueste(desde, hasta),
      usuarios: this.userSvc.getUsers(),
    }).subscribe({
      next: ({ lotesTostados, clasificacion, pedidos, tuestes, estadisticas, usuarios }) => {
        this.procesarInventarioTostado(lotesTostados, usuarios);
        this.procesarClasificacion(clasificacion);
        this.procesarPedidos(pedidos, usuarios, hoy);
        this.procesarTuestes(tuestes, usuarios);
        this.estadisticas = estadisticas;
      },
      error: (err) => console.error('Error cargando dashboard:', err)
    });
  }

  // ── Inventario tostado (solo para "Lotes tostados activos" y "urgentes") ──

  private procesarInventarioTostado(lotes: LoteTostadoConInventario[], usuarios: User[]): void {
    const lotesActivos = lotes.filter(l => !l.eliminado && this.getKgInventario(l) > 0);
    this.totalLotesActivos = lotesActivos.length;

    const urgentes: LoteUrgente[] = [];

    for (const lote of lotesActivos) {
      const kg = this.getKgInventario(lote);
      const user = usuarios.find(u => u.id_user === lote.id_user);
      const rol = user?.rol ?? 'desconocido';
      const dias = differenceInCalendarDays(new Date(), new Date(lote.fecha_tostado));

      // Urgentes: solo lotes de tienda (admin) con más de 7 días sin despachar
      if (rol === 'admin' && dias >= 7) {
        urgentes.push({
          id_lote_tostado: lote.id_lote_tostado,
          tipo: 'Tienda',
          kg,
          dias,
        });
      }
    }

    this.lotesTostadosUrgentes = urgentes.sort((a, b) => b.dias - a.dias);
    this.lotesUrgentes = urgentes.length;
  }

  private getKgInventario(lote: LoteTostadoConInventario): number {
    if (!lote.inventarioLotesTostados?.length) return 0;
    return lote.inventarioLotesTostados.reduce((sum, inv) => sum + (inv.cantidad_kg ?? 0), 0);
  }

  // ── Stock verde + Clasificación (tienda) ──────────────────────

  private procesarClasificacion(data: StockVerdeResponse): void {
    this.stockTotal = Math.round(data.resumen.total);
    this.stockAdmin = Math.round(data.resumen.tienda);
    this.stockClientes = Math.round(data.resumen.clientes);

    const clasifData = data.clasificacion;
    const entries = Object.entries(clasifData).sort((a, b) => b[1] - a[1]);
    const totalClasif = entries.reduce((s, [, kg]) => s + kg, 0);

    if (totalClasif === 0) {
      this.stockTotalVerdes = 0;
      this.clasificaciones = [];
      this.pieSegments = [];
      return;
    }

    const porcentajes = this.calcularPorcentajes(entries.map(([, kg]) => kg));

    this.stockTotalVerdes = Math.round(totalClasif);
    this.clasificaciones = entries.map(([nombre, kg], i) => ({
      nombre,
      kg,
      porcentaje: porcentajes[i],
      color: this.CLASIFICACION_COLORS[nombre] ?? '#888780',
    }));
    this.pieSegments = this.buildPieSegments(this.clasificaciones, totalClasif);
  }

  // Reparte los % con "mayor resto" para que siempre sumen exactamente 100
  private calcularPorcentajes(valores: number[]): number[] {
    const total = valores.reduce((s, v) => s + v, 0);
    if (total === 0) return valores.map(() => 0);

    const crudos = valores.map(v => (v / total) * 100);
    const enteros = crudos.map(r => Math.floor(r));
    const faltante = 100 - enteros.reduce((s, v) => s + v, 0);

    const ordenPorResto = crudos
      .map((r, i) => ({ i, resto: r - Math.floor(r) }))
      .sort((a, b) => b.resto - a.resto);

    const resultado = [...enteros];
    for (let k = 0; k < faltante; k++) {
      resultado[ordenPorResto[k].i]++;
    }
    return resultado;
  }

  private buildPieSegments(items: ClasificacionBar[], total: number): PieSegment[] {
    const cx = 80, cy = 80, r = 70;
    const segments: PieSegment[] = [];
    let startAngle = -Math.PI / 2;
    for (const item of items) {
      const slice = (item.kg / total) * 2 * Math.PI;
      const endAngle = startAngle + slice;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const large = slice > Math.PI ? 1 : 0;
      segments.push({
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
        color: item.color,
      });
      startAngle = endAngle;
    }
    return segments;
  }

  // ── Pedidos ────────────────────────────────────────────────────

  private procesarPedidos(pedidos: Pedido[], usuarios: User[], hoy: Date): void {
    this.clientesMap = {};
    for (const u of usuarios) {
      this.clientesMap[u.id_user] = u.nombre_comercial || u.nombre || 'Sin nombre';
    }

    this.pedidos = [...pedidos]
      .filter(p => !p.eliminado)
      .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
      .slice(0, 8);

    this.totalPendientes = pedidos.filter(p =>
      !p.eliminado && (p.estado_pedido === 'Pendiente' || p.estado_pedido === 'Tostando')
    ).length;

    const inicioMes = startOfMonth(hoy);
    const completadasMes = pedidos.filter(p => {
      if (p.eliminado || p.estado_pedido !== 'Completado') return false;
      const f = new Date(p.fecha_completado ?? p.fecha_registro);
      return f >= inicioMes && f <= hoy;
    });
    this.pedidosCompletadosMes = completadasMes.length;
    this.kgDespachados = Math.round(
      completadasMes.reduce((s, p) => s + (p.cantidad ?? 0), 0)
    );
  }

  // ── Tuestes ────────────────────────────────────────────────────

  private procesarTuestes(pedidos: Pedido[], usuarios: User[]): void {
    this.tuestes = pedidos
      .filter(p => p.tipo_pedido === 'Orden Tueste' && !p.eliminado)
      .map(p => {
        const user = usuarios.find(u => u.id_user === p.id_user);
        return {
          cliente: user?.nombre_comercial || user?.nombre || 'Cliente',
          peso: p.cantidad,
          tueste: p.comentario || 'Sin perfil',
          entrega: this.formatEntrega(p.fecha_tueste),
        };
      })
      .sort((a, b) => {
        const order = ['Hoy', 'Mañana'];
        const ai = order.indexOf(a.entrega);
        const bi = order.indexOf(b.entrega);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }

  // ── Helpers ────────────────────────────────────────────────────

  formatEntrega(fecha: Date | string | undefined): string {
    if (!fecha) return 'Sin fecha';
    const diff = differenceInCalendarDays(new Date(fecha), new Date());
    if (diff <= 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `${diff} días`;
  }

  getTimeAgo(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    const diff = differenceInCalendarDays(new Date(), new Date(fecha));
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'ayer';
    return `hace ${diff}d`;
  }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-amber-50 text-amber-700';
      case 'Tostando': return 'bg-orange-50 text-orange-700';
      case 'Completado': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getBadgeEntrega(entrega: string): string {
    if (entrega === 'Hoy') return 'bg-red-50 text-red-700';
    if (entrega === 'Mañana') return 'bg-amber-50 text-amber-700';
    return 'bg-green-50 text-green-700';
  }

  // ── Distribución ───────────────────────────────────────────────

  getDistSlice(pct: number, offsetPct: number): string {
    const cx = 80, cy = 80, r = 70;
    const toRad = (p: number) => (p / 100) * 2 * Math.PI - Math.PI / 2;
    const startAngle = toRad(offsetPct);
    const endAngle = toRad(offsetPct + pct);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  getPctFortunato(): number {
    if (!this.estadisticas) return 50;
    const total = this.estadisticas.batchFortunato + this.estadisticas.batchTerceros;
    if (total === 0) return 50;
    return Math.round((this.estadisticas.batchFortunato / total) * 100);
  }

  getPctClientes(): number {
    return 100 - this.getPctFortunato();
  }

  // ── Paginador ──────────────────────────────────────────────────

  irA(n: number): void { this.paginaActual = n; }
  anterior(): void { if (this.paginaActual > 0) this.paginaActual--; }
  siguiente(): void { if (this.paginaActual < this.totalPaginas - 1) this.paginaActual++; }
}